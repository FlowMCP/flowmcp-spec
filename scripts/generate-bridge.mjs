#!/usr/bin/env node
// generate-bridge.mjs — per-page "Bridge" projection generator (ported from memo-init repos/spec,
// Memo 060 P5). ONE read-projection of the single skill->spec edge (split per family under
// draft/<family>/<version>/data/skill-spec-map.json — no second data store).
//
// FlowMCP implementer skills are PRIVATE (F9=A), so every family map is intentionally EMPTY; the
// bridge therefore renders an honest "nothing published here yet" projection — the structure is in
// place, symmetric with the meta-spec, and re-arms automatically if a public implementer is ever
// added to a map.
//
// Emits, across all families, ONE per-page bridge for every non-bridge chapter (the NN-bridge.md
// hub pages are excluded), a per-page backlink into the dist, a reshaped NN-bridge.md hub in the
// source spec dir, an enhanced dist hub with Astro frontmatter, and dist/inverted-map.json.
// It also ensures each source chapter carries ONLY the implemented-by placeholder (authored-vs-
// derived split); the rendered block lives in the dist. Idempotent, no network, no secrets.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { discoverSpecs } from './lib/discover-specs.mjs'
import { loadSkillMap, sentinelMapPath } from './lib/load-skill-map.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const PROJECT_ROOT = resolve( REPO, '..', '..' )
const SENTINEL_MAP = sentinelMapPath( { repoRoot: REPO } )

const GENERATOR = 'scripts/generate-bridge.mjs'
const NN_RE = /^\d{2}-.*\.md$/
const BRIDGE_RE = /^\d{2}-bridge\.md$/
const INVERTED_MAP_PATH = join( REPO, 'dist', 'inverted-map.json' )
const bridgeDirFor = ( { name, version } ) => join( REPO, 'dist', name, version, 'bridge' )
const specPayloadDirFor = ( { name, version } ) => join( REPO, 'dist', name, version, 'spec' )

const BACKLINK_START = '<!-- BRIDGE:IMPLEMENTED-BY START — generated, do not edit -->'
const BACKLINK_END = '<!-- BRIDGE:IMPLEMENTED-BY END -->'

const PLACEHOLDER = '<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->'

const FAMILIES = discoverSpecs( { repoRoot: REPO } )


const routeBaseFromDocEntry = ( { docEntry } ) => {
    const pathPart = ( docEntry ?? '' ).replace( /^https?:\/\/[^/]+/, '' )
    const first = pathPart.split( '/' ).filter( ( seg ) => seg.length > 0 )[ 0 ] ?? ''

    return `/${ first }/`
}


const numberFromName = ( { name } ) => {
    const match = name.match( /^(\d{2})-/ )

    return match ? parseInt( match[ 1 ], 10 ) : -1
}


const LEAK_TEST = [ /MEMO-\d+/, /\bMemo \d+/, /\bG\d{3}\b/, /\/Users\// ]
const sanitizeLeak = ( { text } ) => {
    return text
        .replace( /\([^)]*\)/g, ( group ) => LEAK_TEST.some( ( re ) => re.test( group ) ) ? '' : group )
        .replace( /MEMO-\d+/g, '' )
        .replace( /\bMemo \d+/g, '' )
        .replace( /\bG\d{3}\b/g, '' )
        .replace( /\/Users\/\S+/g, '' )
        .replace( /\(\s*\)/g, '' )
        .replace( /\s+([.,;:])/g, '$1' )
        .replace( /\s{2,}/g, ' ' )
        .trim()
}


const purposeFromContent = ( { content } ) => {
    const match = content.match( /^description:\s*(.*)$/m )
    if( match === null ) return ''
    const firstSentence = match[ 1 ].split( /\.\s/ )[ 0 ].replace( /\.$/, '' )
    const clean = sanitizeLeak( { text: firstSentence } )

    return clean.length > 130 ? `${ clean.slice( 0, 127 ).trim() }…` : clean
}


const loadPurposes = async ( { skills } ) => {
    const pairs = await Promise.all( skills.map( async ( skill ) => {
        const abs = join( PROJECT_ROOT, skill.path ?? '' )
        const content = await readFile( abs, 'utf-8' ).catch( () => null )
        const purpose = content === null ? '' : purposeFromContent( { content } )

        return [ skill.skill, purpose ]
    } ) )

    return new Map( pairs )
}


const collectPages = async ( { specDirAbs, prefix } ) => {
    const manifest = JSON.parse( readFileSync( join( specDirAbs, 'spec-manifest.json' ), 'utf-8' ) )
    const fromManifest = ( manifest.groups ?? [] )
        .flatMap( ( group ) => Array.isArray( group.pages ) === true ? group.pages : [] )
    const onDisk = ( await readdir( specDirAbs ) )
        .filter( ( name ) => NN_RE.test( name ) === true )
        .map( ( name ) => name.replace( /\.md$/, '' ) )
    const stems = [ ...new Set( [ ...fromManifest, ...onDisk ] ) ]
        .filter( ( stem ) => /-bridge$/.test( stem ) === false )
        .sort( ( a, b ) => numberFromName( { name: `${ a }.md` } ) - numberFromName( { name: `${ b }.md` } ) )
    const groups = ( manifest.groups ?? [] ).map( ( group ) => ( {
        id: group.id,
        label: group.label,
        order: group.order,
        pages: ( Array.isArray( group.pages ) === true ? group.pages : [] )
            .filter( ( stem ) => /-bridge$/.test( stem ) === false )
    } ) )

    return { pages: stems.map( ( stem ) => ( { stem, id: `${ prefix }${ stem }` } ) ), groups }
}


const resolveBridgeNN = async ( { specDirAbs } ) => {
    const names = await readdir( specDirAbs )
    const existingBridge = names.find( ( name ) => BRIDGE_RE.test( name ) === true )
    if( existingBridge !== undefined ) return existingBridge.match( /^(\d{2})-/ )[ 1 ]
    const numbers = names
        .filter( ( name ) => NN_RE.test( name ) === true && BRIDGE_RE.test( name ) === false )
        .map( ( name ) => numberFromName( { name } ) )
    const next = ( numbers.length === 0 ? 0 : Math.max( ...numbers ) ) + 1

    return String( next ).padStart( 2, '0' )
}


const implementersFor = ( { skills, id } ) => {
    return skills
        .filter( ( skill ) => Array.isArray( skill.all ) === true && skill.all.includes( id ) === true )
        .map( ( skill ) => ( { ...skill, role: skill.primary === id ? 'primary' : 'contributing' } ) )
        .sort( ( a, b ) => a.skill.localeCompare( b.skill ) )
}


const graderFor = ( { implementers } ) => {
    const marked = implementers.find( ( skill ) => skill.roleHint === 'grader' )
    if( marked !== undefined ) return { skill: marked.skill, inferred: false }
    const guessed = implementers.find( ( skill ) => {
        return [ 'grade', 'evals' ].includes( skill.category ) === true || /score|grade|fidelity/.test( skill.skill ) === true
    } )

    return guessed === undefined ? null : { skill: guessed.skill, inferred: true }
}


const publicEntriesFor = ( { implementers, family } ) => {
    const marked = implementers.filter( ( skill ) => skill.roleHint === 'public-entry' )
    if( marked.length > 0 ) return { skills: marked.map( ( s ) => s.skill ), inferred: false, doc: family.docEntry }
    const owners = implementers.filter( ( skill ) => skill.role === 'primary' )

    return { skills: owners.map( ( s ) => s.skill ), inferred: true, doc: family.docEntry }
}


const detailPagesFrom = ( { content, selfStem } ) => {
    const head = content.split( /\n##\s/ )[ 0 ]
    const rows = head
        .split( '\n' )
        .filter( ( line ) => /^\|\s*(Depends on|Related)\s*\|/.test( line ) === true )
    const refs = rows
        .flatMap( ( line ) => [ ...line.matchAll( /\(\.\/(\d{2}-[^).]+)\.md\)/g ) ].map( ( m ) => m[ 1 ] ) )

    return [ ...new Set( refs ) ]
        .filter( ( stem ) => stem !== selfStem )
        .sort( ( a, b ) => numberFromName( { name: `${ a }.md` } ) - numberFromName( { name: `${ b }.md` } ) )
}


const primaryOwners = ( { implementers } ) => implementers.filter( ( skill ) => skill.role === 'primary' )

const gapsRollup = ( { implementers } ) => {
    const owners = primaryOwners( { implementers } )
    const gaps = owners.flatMap( ( skill ) => Array.isArray( skill.gaps ) === true ? skill.gaps : [] )

    return [ ...new Set( gaps ) ].sort( ( a, b ) => a.localeCompare( b ) )
}

const internalToolingFor = ( { internal } ) => {
    return internal
        .map( ( skill ) => ( { skill: skill.skill, category: skill.category } ) )
        .sort( ( a, b ) => a.skill.localeCompare( b.skill ) )
}


const clustersFor = ( { implementers } ) => {
    return [ ...new Set( implementers.map( ( skill ) => skill.category ) ) ].sort( ( a, b ) => a.localeCompare( b ) )
}


const buildRecord = ( { family, stem, id, content, skills, purposes } ) => {
    const allImplementers = implementersFor( { skills, id } )
    const implementers = allImplementers.filter( ( skill ) => skill.visibility !== 'internal' )
    const internal = allImplementers.filter( ( skill ) => skill.visibility === 'internal' )
    const enumeration = implementers.map( ( skill ) => ( {
        skill: skill.skill,
        role: skill.role,
        category: skill.category,
        purpose: purposes.get( skill.skill ) ?? ''
    } ) )
    const record = {
        family: family.name,
        stem,
        id,
        sopAnchor: family.sopAnchor,
        publicEntries: publicEntriesFor( { implementers, family } ),
        detailPages: detailPagesFrom( { content, selfStem: stem } ),
        implementers: enumeration,
        internalCount: internal.length,
        requirementCount: ( content.match( /```requirement/g ) ?? [] ).length,
        grader: graderFor( { implementers } ),
        gaps: gapsRollup( { implementers } ),
        outOfScope: internalToolingFor( { internal } ),
        clusters: clustersFor( { implementers } )
    }
    const provenance = createHash( 'sha256' ).update( JSON.stringify( record ) ).digest( 'hex' ).slice( 0, 12 )

    return { ...record, provenance }
}


const relLink = ( { stem } ) => `[${ stem }](./${ stem }.md)`


const renderBridgePage = ( { record } ) => {
    const { stem, family, sopAnchor, publicEntries, detailPages, implementers, grader, outOfScope } = record

    const entryLine = publicEntries.skills.length === 0
        ? `Canonical docs entry: \`${ publicEntries.doc }\`. No entry-point skill flagged yet.`
        : `${ publicEntries.skills.map( ( s ) => `\`${ s }\`` ).join( ', ' ) }${ publicEntries.inferred === true ? ' _(inferred from primary owners)_' : '' } · docs entry \`${ publicEntries.doc }\``

    const detailLine = detailPages.length === 0
        ? '— none —'
        : detailPages.map( ( s ) => relLink( { stem: s } ) ).join( ', ' )

    const skillRows = implementers.length === 0
        ? '| — | — | nothing built against this chapter yet |'
        : implementers
            .map( ( s ) => `| \`${ s.skill }\` | ${ s.role } | ${ s.purpose === '' ? '—' : s.purpose } |` )
            .join( '\n' )

    const gradingLine = grader === null
        ? 'No grader assigned yet.'
        : `Grading handled by \`${ grader.skill }\`${ grader.inferred === true ? ' _(inferred)_' : '' }.`

    const internalToolingLine = ( outOfScope ?? [] ).length === 0
        ? '— none —'
        : outOfScope.map( ( o ) => `\`${ o.skill }\`` ).join( ', ' )

    return [
        `# Bridge — ${ stem }`,
        '',
        '| Field | Value |',
        '|---|---|',
        '| Family | ' + family + ' |',
        '| Chapter | ' + relLink( { stem } ) + ' |',
        '',
        '> **Informative · generated.** One read-projection of the skill-to-spec edge. Do not edit by hand.',
        '',
        `<!-- Auto-generated by ${ GENERATOR } from the skill-to-spec map. -->`,
        '',
        '## 1. SOP anchor',
        '',
        `This chapter is entered through the ${ family } SOP: ${ relLink( { stem: sopAnchor } ) }.`,
        '',
        '## 2. Public entry points',
        '',
        entryLine,
        '',
        '## 3. Required detail pages',
        '',
        detailLine,
        '',
        '## 4. Implementing skills',
        '',
        '| Skill | Role | Purpose |',
        '|---|---|---|',
        skillRows,
        '',
        '## 5. Grading assignment',
        '',
        gradingLine,
        '',
        '## 6. Acknowledged internal tooling',
        '',
        internalToolingLine,
        ''
    ].join( '\n' )
}


const renderBacklink = ( { implementers } ) => {
    const body = implementers.length === 0
        ? '- — none yet (nothing built against this chapter) —'
        : implementers.map( ( s ) => `- \`${ s.skill }\` — ${ s.role }` ).join( '\n' )

    return [
        BACKLINK_START,
        '## Implemented by',
        '',
        'The skills below implement this chapter (primary owner first). The full per-page bridge with all six public projection fields is published under `dist/<family>/<version>/bridge/`.',
        '',
        body,
        '',
        BACKLINK_END
    ].join( '\n' )
}


const ensurePlaceholder = ( { content } ) => {
    const startIdx = content.indexOf( BACKLINK_START )
    if( startIdx !== -1 ) {
        const endIdx = content.indexOf( BACKLINK_END, startIdx )
        const tail = content.slice( endIdx + BACKLINK_END.length )

        return `${ content.slice( 0, startIdx ) }${ PLACEHOLDER }${ tail }`
    }
    if( content.indexOf( PLACEHOLDER ) !== -1 ) return content
    const relatedMatch = content.match( /\n##\s+Related\s*\n/ )
    if( relatedMatch !== null ) {
        const at = relatedMatch.index

        return `${ content.slice( 0, at ) }\n\n${ PLACEHOLDER }\n${ content.slice( at + 1 ) }`
    }
    const trimmed = content.replace( /\s+$/, '' )

    return `${ trimmed }\n\n${ PLACEHOLDER }\n`
}


const renderOverviewAndViews = ( { records } ) => {
    const publicSkills = new Set( records.flatMap( ( r ) => r.implementers.map( ( s ) => s.skill ) ) )
    const sopAnchor = records.length === 0 ? null : records[ 0 ].sopAnchor
    const covered = records.filter( ( r ) => r.implementers.length > 0 ).length
    const withReqs = records.filter( ( r ) => r.requirementCount > 0 ).length

    const chapterRows = records
        .map( ( r ) => {
            const reqCell = r.requirementCount === 0 ? '—' : String( r.requirementCount )
            const publicCell = r.implementers.length === 0 ? '— none —' : r.implementers.map( ( s ) => `\`${ s.skill }\`` ).join( ', ' )
            const dependsCell = r.detailPages.length === 0 ? '—' : r.detailPages.map( ( s ) => relLink( { stem: s } ) ).join( ', ' )

            return `| ${ relLink( { stem: r.stem } ) } | ${ reqCell } | ${ publicCell } | ${ dependsCell } |`
        } )
        .join( '\n' )

    const skillToChapters = records.reduce( ( acc, r ) => {
        r.implementers.forEach( ( s ) => {
            const list = acc.get( s.skill ) ?? []
            acc.set( s.skill, [ ...list, { stem: r.stem, role: s.role } ] )
        } )

        return acc
    }, new Map() )
    const skillRows = [ ...skillToChapters.entries() ]
        .sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) )
        .map( ( pair ) => {
            const chapters = pair[ 1 ]
            const primaries = chapters.filter( ( c ) => c.role === 'primary' ).map( ( c ) => `${ relLink( { stem: c.stem } ) } (primary)` )
            const contribs = chapters.filter( ( c ) => c.role !== 'primary' ).map( ( c ) => relLink( { stem: c.stem } ) )
            const deps = [ ...primaries, ...contribs ].join( ', ' )

            return `| \`${ pair[ 0 ] }\` | ${ deps } |`
        } )
        .join( '\n' )

    return [
        '## Overview',
        '',
        `- **Implementer skills:** ${ publicSkills.size }`,
        `- **SOP anchor:** ${ sopAnchor === null ? '—' : relLink( { stem: sopAnchor } ) }`,
        `- **Coverage:** ${ covered } of ${ records.length } chapters; ${ withReqs } chapter(s) carry inline requirements.`,
        '',
        '## Views',
        '',
        '### By chapter — requirements · implementers · dependencies',
        '',
        '| Chapter | Reqs | Implementers | Depends on |',
        '|---|---|---|---|',
        chapterRows === '' ? '| — | — | — | — |' : chapterRows,
        '',
        '### By skill — dependencies (skill → chapters)',
        '',
        '| Skill | Chapters (dependencies) |',
        '|---|---|',
        skillRows === '' ? '| — | — |' : skillRows
    ].join( '\n' )
}


const renderHubPage = ( { nn, family, records, relatedRefs } ) => {
    const overviewAndViews = renderOverviewAndViews( { records } )
    const relatedRow = relatedRefs.map( ( ref ) => `[./${ ref }.md](./${ ref }.md)` ).join( ', ' )
    const relatedList = relatedRefs.map( ( ref ) => `- [./${ ref }.md](./${ ref }.md) — family entry point` ).join( '\n' )

    return [
        `# ${ nn }. Bridge`,
        '',
        '| Field | Value |',
        '|---|---|',
        '| Status | Draft |',
        `| Related | ${ relatedRow } |`,
        '',
        '> **Informative.**',
        '',
        'This page maps each specification chapter to the skills that implement it — so you can see which parts of the workflow are covered and where to look next.',
        '',
        '<!-- generated -->',
        `<!-- Auto-generated by ${ GENERATOR } from the skill-to-spec map. Do not edit by hand; re-run the spec build to regenerate. -->`,
        '',
        overviewAndViews,
        '',
        '## Related',
        '',
        relatedList,
        ''
    ].join( '\n' )
}


const toMermaidId = ( { text } ) => {
    const clean = text.replace( /[^a-zA-Z0-9]/g, '_' )

    return /^\d/.test( clean ) === true ? `n_${ clean }` : clean
}


const renderCoverageSummary = ( { records } ) => {
    const covered = records.filter( ( r ) => r.implementers.length > 0 ).length
    const totalReqs = records.reduce( ( sum, r ) => sum + r.requirementCount, 0 )

    const headRows = records.map( ( r ) => {
        const coveredCell = r.implementers.length > 0 ? '✓' : '—'
        const reqCell = r.requirementCount === 0 ? '—' : String( r.requirementCount )

        return `| ${ relLink( { stem: r.stem } ) } | ${ coveredCell } | ${ r.implementers.length } | ${ reqCell } |`
    } ).join( '\n' )

    const summaryRow = `| **Summary** | **${ covered } / ${ records.length }** | — | ${ totalReqs > 0 ? String( totalReqs ) : '—' } |`

    return [
        '## Coverage summary',
        '',
        '| Chapter | Covered | Implementers | Reqs |',
        '|---|---|---|---|',
        headRows === '' ? '| — | — | — | — |' : headRows,
        summaryRow
    ].join( '\n' )
}


const renderChaptersSection = ( { records, groups } ) => {
    const byStem = new Map( records.map( ( r ) => [ r.stem, r ] ) )
    const assigned = new Set()
    const orderedGroups = [ ...( groups ?? [] ) ].sort( ( a, b ) => ( a.order ?? 0 ) - ( b.order ?? 0 ) )

    const chapterLine = ( { record } ) => {
        const skills = record.implementers.length === 0
            ? '_— no implementer skill yet —_'
            : record.implementers.map( ( s ) => `\`${ s.skill }\`` ).join( ', ' )

        return `- ${ relLink( { stem: record.stem } ) } — ${ skills }`
    }

    const groupBlocks = orderedGroups.flatMap( ( group ) => {
        const inGroup = ( group.pages ?? [] )
            .map( ( stem ) => byStem.get( stem ) )
            .filter( ( record ) => record !== undefined )
        inGroup.forEach( ( record ) => assigned.add( record.stem ) )
        if( inGroup.length === 0 ) return []

        return [ [
            `### ${ group.label ?? group.id }`,
            '',
            inGroup.map( ( record ) => chapterLine( { record } ) ).join( '\n' )
        ].join( '\n' ) ]
    } )

    const leftover = records.filter( ( record ) => assigned.has( record.stem ) === false )
    const otherBlock = leftover.length === 0
        ? []
        : [ [
            '### Other',
            '',
            leftover.map( ( record ) => chapterLine( { record } ) ).join( '\n' )
        ].join( '\n' ) ]

    const allBlocks = [ ...groupBlocks, ...otherBlock ]

    return [
        '## Chapters',
        '',
        allBlocks.length === 0 ? '— no chapters —' : allBlocks.join( '\n\n' )
    ].join( '\n' )
}


const renderBySkillSection = ( { records } ) => {
    const skillData = new Map()
    records.forEach( ( r ) => {
        r.implementers.forEach( ( s ) => {
            const entry = skillData.get( s.skill ) ?? { category: s.category, chapters: [] }
            skillData.set( s.skill, {
                category: entry.category,
                chapters: [ ...entry.chapters, { stem: r.stem, role: s.role } ]
            } )
        } )
    } )

    const byCategory = new Map()
    skillData.forEach( ( data, skill ) => {
        const cat = data.category ?? 'uncategorized'
        const group = byCategory.get( cat ) ?? []
        byCategory.set( cat, [ ...group, { skill, chapters: data.chapters } ] )
    } )

    const sortedCats = [ ...byCategory.keys() ].sort()
    const totalSkills = skillData.size

    if( totalSkills === 0 ) {
        return [
            '## Skills by namespace',
            '',
            '— no public implementer skills yet —'
        ].join( '\n' )
    }

    const catBlocks = sortedCats.map( ( cat ) => {
        const skillsInCat = ( byCategory.get( cat ) ?? [] ).sort( ( a, b ) => a.skill.localeCompare( b.skill ) )
        const skillRows = skillsInCat.map( ( entry ) => {
            const primaries = entry.chapters
                .filter( ( c ) => c.role === 'primary' )
                .map( ( c ) => `${ relLink( { stem: c.stem } ) } (primary)` )
            const contribs = entry.chapters
                .filter( ( c ) => c.role !== 'primary' )
                .map( ( c ) => relLink( { stem: c.stem } ) )
            const chapterCell = [ ...primaries, ...contribs ].join( ', ' )

            return `| \`${ entry.skill }\` | ${ chapterCell } |`
        } ).join( '\n' )

        return [
            `### ${ cat } (${ skillsInCat.length } skill${ skillsInCat.length === 1 ? '' : 's' })`,
            '',
            '| Skill | Chapters |',
            '|---|---|',
            skillRows,
            ''
        ].join( '\n' )
    } ).join( '\n' )

    return [
        '## Skills by namespace',
        '',
        catBlocks,
        `**Summary: ${ sortedCats.length } namespace${ sortedCats.length === 1 ? '' : 's' } · ${ totalSkills } skill${ totalSkills === 1 ? '' : 's' } total**`
    ].join( '\n' )
}


const renderMermaidSection = ( { records, familyName, skills } ) => {
    const skillsByName = new Map( ( skills ?? [] ).map( ( s ) => [ s.skill, s ] ) )

    const allImplementerNames = [ ...new Set( records.flatMap( ( r ) => r.implementers.map( ( s ) => s.skill ) ) ) ]
    const requiresEdges = allImplementerNames.flatMap( ( skillName ) => {
        const data = skillsByName.get( skillName )
        if( data === undefined || Array.isArray( data.requires ) === false || data.requires.length === 0 ) return []

        return data.requires.map( ( target ) => ( { from: skillName, to: target } ) )
    } )
    const requiresNodes = [ ...new Set( [ ...requiresEdges.map( ( e ) => e.from ), ...requiresEdges.map( ( e ) => e.to ) ] ) ].sort()

    const dagBlock = requiresEdges.length === 0
        ? [ '_(no skill dependencies declared in this family)_' ]
        : [
            '```mermaid',
            'flowchart TD',
            ...requiresNodes.map( ( s ) => `    sk_${ toMermaidId( { text: s } ) }["${ s }"]` ),
            ...requiresEdges.map( ( e ) => `    sk_${ toMermaidId( { text: e.from } ) } --> sk_${ toMermaidId( { text: e.to } ) }` ),
            '```'
        ]

    return [
        '## Graph views',
        '',
        `### Skill dependency graph — \`requires\` edges (${ familyName })`,
        '',
        ...dagBlock
    ].join( '\n' )
}


const renderDistHub = ( { nn, family, records, skills, groups } ) => {
    const coverageSummary = renderCoverageSummary( { records } )
    const bySkill = renderBySkillSection( { records } )
    const chapters = renderChaptersSection( { records, groups } )
    const graphViews = renderMermaidSection( { records, familyName: family, skills: skills ?? [] } )

    return [
        `# ${ nn }. Bridge — ${ family }`,
        '',
        'This page maps each specification chapter to the skills that implement it — so you can see which parts of the workflow are covered and where to look next.',
        '',
        '> **Informative · generated.** Do not edit by hand; re-run the spec build to regenerate.',
        '',
        `<!-- Auto-generated by ${ GENERATOR } from the skill-to-spec map. -->`,
        '',
        graphViews,
        '',
        coverageSummary,
        '',
        bySkill,
        '',
        chapters,
        ''
    ].join( '\n' )
}


const escapeYaml = ( { value } ) => {
    return value.replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' ).replace( /\n/g, ' ' )
}


const rewriteLinks = ( { content, routeBase } ) => {
    return content.replace(
        /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](${ routeBase }${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
}


const buildHubFrontmatter = ( { nn, family } ) => {
    const record = FAMILIES.find( ( f ) => f.name === family )
    const version = record?.version ?? '0.1.0'
    const desc = escapeYaml( {
        value: `Bridge hub for the ${ family } specification: per-chapter skill coverage, Mermaid graph views, and by-skill namespace grouping.`
    } )
    const order = parseInt( nn, 10 )
    const now = new Date().toISOString()

    return [
        '---',
        `title: "Bridge"`,
        `description: "${ desc }"`,
        `family: "${ family }"`,
        `spec_version: "${ version }"`,
        `spec_file: "${ nn }-bridge.md"`,
        `order: ${ order }`,
        `section: "${ family }"`,
        `normative: false`,
        `generated_at: "${ now }"`,
        `generated_from: "generated (bridge dist-hub)"`,
        `generator: "${ GENERATOR }"`,
        `edit_warning: "This file is auto-generated by ${ GENERATOR }. Do not edit by hand."`,
        '---'
    ].join( '\n' ) + '\n'
}


const main = async () => {
    if( existsSync( SENTINEL_MAP ) === false ) {
        console.warn( `generate-bridge: skipped — per-family skill-spec-map.json not found at ${ SENTINEL_MAP }.` )

        return
    }
    const map = await loadSkillMap( { repoRoot: REPO } )
    const skills = Array.isArray( map.skills ) === true ? map.skills : []
    const purposes = await loadPurposes( { skills } )

    const families = await Promise.all( FAMILIES.map( async ( family ) => {
        const specDirAbs = join( REPO, family.specDir )
        const nn = await resolveBridgeNN( { specDirAbs } )
        const { pages, groups } = await collectPages( { specDirAbs, prefix: family.prefix } )

        const records = await Promise.all( pages.map( async ( { stem, id } ) => {
            const sourcePath = join( specDirAbs, `${ stem }.md` )
            const content = await readFile( sourcePath, 'utf-8' )
            const record = buildRecord( { family, stem, id, content, skills, purposes } )

            const outDir = bridgeDirFor( { name: family.name, version: family.version } )
            await mkdir( outDir, { recursive: true } )
            await writeFile( join( outDir, `${ stem }.md` ), renderBridgePage( { record } ), 'utf-8' )

            const block = renderBacklink( { implementers: record.implementers } )
            await writeFile( join( outDir, `${ stem }.backlink.md` ), `${ block }\n`, 'utf-8' )
            const nextContent = ensurePlaceholder( { content } )
            const backlinkChanged = nextContent !== content
            if( backlinkChanged === true ) await writeFile( sourcePath, nextContent, 'utf-8' )

            return { record, backlinkChanged }
        } ) )

        const recordList = records.map( ( r ) => r.record )

        const bridgeOutDir = bridgeDirFor( { name: family.name, version: family.version } )
        const distHubContent = renderDistHub( { nn, family: family.name, records: recordList, skills, groups } )
        const distHubPath = join( bridgeOutDir, `${ nn }-bridge.md` )
        const prevDistHub = await readFile( distHubPath, 'utf-8' ).catch( () => null )
        if( prevDistHub !== distHubContent ) await writeFile( distHubPath, distHubContent, 'utf-8' )

        const specOutDir = specPayloadDirFor( { name: family.name, version: family.version } )
        await mkdir( specOutDir, { recursive: true } )
        const specHubFrontmatter = buildHubFrontmatter( { nn, family: family.name } )
        const specHubBodyNoH1 = distHubContent.replace( /^#[^\n]+\n+/, '' )
        const specHubBodyRewritten = rewriteLinks( { content: specHubBodyNoH1, routeBase: routeBaseFromDocEntry( { docEntry: family.docEntry } ) } )
        const specHubContent = specHubFrontmatter + '\n' + specHubBodyRewritten
        const specHubPath = join( specOutDir, `${ nn }-bridge.md` )
        const prevSpecHub = await readFile( specHubPath, 'utf-8' ).catch( () => null )
        const specHubChanged = prevSpecHub !== specHubContent
        if( specHubChanged === true ) await writeFile( specHubPath, specHubContent, 'utf-8' )

        const hubPath = join( specDirAbs, `${ nn }-bridge.md` )
        const hubContent = renderHubPage( { nn, family: family.name, records: recordList, relatedRefs: family.relatedRefs } )
        const prevHub = await readFile( hubPath, 'utf-8' ).catch( () => null )
        if( prevHub !== hubContent ) await writeFile( hubPath, hubContent, 'utf-8' )

        return {
            key: family.name,
            version: family.version,
            specDir: family.specDir,
            nn,
            records: recordList,
            backlinkChanges: records.filter( ( r ) => r.backlinkChanged === true ).length,
            hubChanged: prevHub !== hubContent,
            distHubChanged: prevDistHub !== distHubContent,
            specHubChanged
        }
    } ) )

    const mapHash = createHash( 'sha256' ).update( JSON.stringify( map ) ).digest( 'hex' ).slice( 0, 12 )
    const inverted = {
        note: 'Inverted skill->spec projection (read-only): one entry per non-bridge spec page, listing its public implementer skills with role. Generated from skill-spec-map.json. Two internal fields are NEVER published here: the gaps roll-up and the per-record provenance hash.',
        generator: GENERATOR,
        mapHash,
        pages: families.flatMap( ( family ) => family.records ).map( ( r ) => ( {
            family: r.family,
            id: r.id,
            stem: r.stem,
            sopAnchor: r.sopAnchor,
            publicEntries: r.publicEntries.skills,
            publicEntriesInferred: r.publicEntries.inferred,
            detailPages: r.detailPages,
            implementers: r.implementers.map( ( s ) => ( { skill: s.skill, role: s.role } ) ),
            grader: r.grader,
            outOfScope: r.outOfScope.map( ( o ) => o.skill ),
            clusters: r.clusters,
            requirementCount: r.requirementCount,
            internalCount: r.internalCount
        } ) )
    }
    await mkdir( dirname( INVERTED_MAP_PATH ), { recursive: true } )
    await writeFile( INVERTED_MAP_PATH, `${ JSON.stringify( inverted, null, 4 ) }\n`, 'utf-8' )

    const totalPages = families.reduce( ( sum, f ) => sum + f.records.length, 0 )
    families.forEach( ( f ) => {
        const covered = f.records.filter( ( r ) => r.implementers.length > 0 ).length
        console.log( `  ✓ ${ f.key }: ${ f.records.length } per-page bridge(s) → dist/${ f.key }/${ f.version }/bridge/ (${ covered } covered), hub ${ f.specDir }/${ f.nn }-bridge.md, ${ f.backlinkChanges } backlink change(s)` )
    } )
    console.log( `generate-bridge: ${ totalPages } per-page bridges across ${ families.length } families; inverted-map.json published to dist/ (mapHash ${ mapHash }).` )
}


const isEntrypoint = process.argv[ 1 ] === fileURLToPath( import.meta.url )
if( isEntrypoint === true ) {
    main().catch( ( err ) => {
        console.error( err )
        process.exit( 1 )
    } )
}
