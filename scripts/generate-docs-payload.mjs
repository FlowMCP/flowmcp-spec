#!/usr/bin/env node
// generate-docs-payload.mjs — Memo 049 Phase 5 PRD-18; Memo 086 PRD-06 (grading second source)
//
// Reads spec/v<version>/*.md AND grading/<version>/*.md, adds YAML frontmatter with
// discovery metadata, rewrites cross-references to relative links, and writes the
// result to generated/docs-payload/{NN}-{slug}.md (spec) and
// generated/docs-payload/grading/{NN}-{slug}.md (grading).
//
// Single-Payload (Memo 081/086): the grading spec is a SECOND INPUT, not a second
// output. Grading is emitted additively into a subdir.
//
// Memo 088 (PRD-Related-Spec / PRD-SpecLinks): the spec pass now mirrors the
// grading pass — it relocates the per-chapter Depends-on/Related metadata table
// to a "## Related" footer and rewrites relative ./NN-name.md links to
// /specification/<slug>/ routes. The spec output is therefore no longer
// byte-identical to the pre-Memo-088 output.
//
// Output format documented in:
//   generated/docs-payload/README.md
//   Memo 049 REV-06 Chapter 6


import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

// Spec content version is the curated value in data/refs.manual.json
// (spec.currentVersion) — the same single source generate-refs uses. The
// package.json version tracks the npm package and may diverge from the
// published spec content directory (e.g. a tooling patch release), so reading
// it here would point at a non-existent spec/v<pkg> directory (#79).
const REFS_MANUAL_PATH = join( REPO, 'data/refs.manual.json' )
const { readFileSync } = await import( 'node:fs' )
const REFS_MANUAL = JSON.parse( readFileSync( REFS_MANUAL_PATH, 'utf-8' ) )
const SPEC_VERSION = REFS_MANUAL?.spec?.currentVersion
if( typeof SPEC_VERSION !== 'string' || SPEC_VERSION.length === 0 ) {
    throw new Error( '[generate-docs-payload] data/refs.manual.json spec.currentVersion missing or empty' )
}
const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const GRADING_ROOT = join( REPO, 'grading' )
const GRADING_PAYLOAD_DIR = join( PAYLOAD_DIR, 'grading' )
// Memo 108: third track — best-practice (advisory). Same additive shape as grading.
const BEST_PRACTICE_ROOT = join( REPO, 'best-practice' )
const BEST_PRACTICE_PAYLOAD_DIR = join( PAYLOAD_DIR, 'best-practice' )
const GENERATOR = 'scripts/generate-docs-payload.mjs'


// Prosaic files (from granularity table — Memo 049 REV-06 Kap. 4.3)
const PROSAIC_FILES = new Set( [
    '00-overview.md',
    '08-migration.md',
    '21-schema-lifecycle.md'
] )


// Grading prosaic files — the grading overview is conceptual prose.
const GRADING_PROSAIC_FILES = new Set( [
    '00-overview.md'
] )


// Memo 108: best-practice prosaic files — the overview is prose; the five
// schema-creation areas are advisory recommendations (non-normative too, derived
// from their "| Status | Recommendation |" table by gradingNormativeFn).
const BEST_PRACTICE_PROSAIC_FILES = new Set( [
    '01-overview.md'
] )


// Memo 086 PRD-06: grading version is the highest semver folder under grading/
// (no hardcode — follows whatever the released grading spec is).
const pickMaxSemverDir = ( { names } ) => {
    const semverDirs = names
        .filter( ( name ) => /^\d+\.\d+\.\d+$/.test( name ) )
        .sort( ( a, b ) => a.localeCompare( b, undefined, { numeric: true } ) )
    return semverDirs.length > 0 ? semverDirs.at( -1 ) : null
}


const escapeYamlString = ( { value } ) => {
    // Escape backslash and double-quote for YAML double-quoted strings
    return value
        .replace( /\\/g, '\\\\' )
        .replace( /"/g, '\\"' )
        .replace( /\n/g, ' ' )
}


const extractTitle = ( { content } ) => {
    const match = content.match( /^#\s+(.+?)\s*$/m )
    if( !match ) return null
    // Strip "FlowMCP Specification v4.1.0 — " prefix
    return match[ 1 ].replace( /^FlowMCP Specification v[\d.]+\s*[—-]\s*/, '' ).trim()
}


const extractDescription = ( { content } ) => {
    // Strip frontmatter if any, and strip the conformance note quote
    const lines = content.split( '\n' )
    const candidates = []
    for( let i = 0; i < lines.length; i++ ) {
        const line = lines[ i ].trim()
        if( line === '' ) continue
        if( line.startsWith( '#' ) ) continue
        if( line.startsWith( '>' ) ) continue
        if( line.startsWith( '---' ) ) continue
        if( line.startsWith( '|' ) ) continue
        if( line.startsWith( '```' ) ) continue
        // Memo 087 PRD-01: skip the RFC2119/BCP-14 conformance-language boilerplate
        // so it never becomes the description. Grading chapters lead with metadata +
        // a conformance section (no intro paragraph), so without this they grabbed
        // "This document uses the key words ...". Spec chapters lead with a real
        // intro, so this skip never triggers for them.
        if( /^this document uses the key words/i.test( line ) ) continue
        if( /\bBCP ?14\b/i.test( line ) || /\bRFC ?2119\b/i.test( line ) ) continue
        if( /\bconformance interpretation\b/i.test( line ) ) continue
        // First substantive paragraph
        candidates.push( line )
        break
    }
    if( candidates.length === 0 ) return ''
    let desc = candidates[ 0 ]
    // Truncate to 200 chars at word boundary
    if( desc.length > 200 ) {
        desc = desc.slice( 0, 200 ).replace( /\s+\S*$/, '' ) + '...'
    }
    return desc
}


const rewriteCrossRefs = ( { content } ) => {
    // Rewrite "see N-name.md" → "[N-name](./N-name.md)"
    // Skip code blocks and existing markdown links
    let result = content
    // Match "see `NN-name.md`" or "see NN-name.md" — consume both backticks if present
    result = result.replace(
        /\bsee\s+(`)?(\d{2}-[a-z][a-z0-9-]*)\.md\1/g,
        ( match, _backtick, slug ) => `see [${ slug }](./${ slug }.md)`
    )
    // Also catch bare "see NN-name.md" without backticks
    result = result.replace(
        /\bsee\s+(\d{2}-[a-z][a-z0-9-]*)\.md\b/g,
        ( match, slug ) => `see [${ slug }](./${ slug }.md)`
    )
    // Memo 059 PRD-008 (D3 + D4): the docs site renders Starlight slugs
    // (e.g. /specification/overview/) — a literal "./00-overview.md" relative
    // link in the markdown would 404 in the browser. Rewrite the
    // conformance-blockquote link to the actual rendered route AND deep-link
    // to the Conformance Language heading so the user lands directly on the
    // relevant section.
    result = result.replace(
        /\[00-overview\.md\]\(\.\/00-overview\.md\)\s+\(Conformance Language\)/g,
        '[Conformance Language](/specification/overview/#conformance-language)'
    )
    // Plain mentions like "13-resources.md" without context — leave as is
    // (the file resolves locally in docs-payload/)
    return result
}


const slugFromFilename = ( { filename } ) => {
    // "13-resources.md" → "resources"
    return filename.replace( /^\d+-/, '' ).replace( /\.md$/, '' )
}


// Memo 087 PRD-P2-A: grading link rewrite. The grading source uses relative
// sibling links "[text](./NN-name.md)" which 404 on the site (rendered at
// /grading/<slug>/). GitHub-blob cross-refs into the sister spec resolve to the
// in-site /specification/<slug>/ route. Anchors are preserved. Annex .json links
// are left untouched (not rendered as pages).
const gradingLinkRewrite = ( { content } ) => {
    let result = content
    result = result.replace(
        /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](/grading/${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
    result = result.replace(
        /\]\(https:\/\/github\.com\/FlowMCP\/flowmcp-spec\/blob\/[^)]*?\/spec\/v[\d.]+\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](/specification/${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
    return result
}


// Memo 087 PRD-P2-B (F2): grading metadata footer. The grading source carries a
// metadata table right after the H1 (Status/Version/Depends-on/Related/Annex)
// plus a redundant "> **Spec/Status/Changes**" blockquote. F2: Status/Version
// drop (all chapters are normative per the conformance note), Depends-on/Related/
// Annex relocate to a "## Related" footer at the end (AI-navigation value kept).
// The conformance-language blockquote stays. `normative` is derived upstream by
// gradingNormativeFn (reads the table BEFORE this strip), so dropping it here is
// safe. Memo 088: the spec pass reuses this same footer mechanism (its chapters
// now carry a Depends-on/Related table after the H1).
const FOOTER_LABELS = new Set( [ 'depends on', 'related', 'annex', 'replaced by' ] )


// Memo 142 (NORMATIVE): the "> Normative language (MUST/SHOULD/MAY) ..." conformance
// blockquote is hand-written in every chapter source. The conformance interpretation
// is defined ONCE in the overview (the anchor); every other chapter merely repeats the
// pointer as boilerplate. Strip it from all non-overview pages during generation — a
// single lever instead of editing every source file, and regression-proof for any new
// chapter added later. The overview keeps the note (it IS the anchor).
const NORMATIVE_NOTE_RE = /^>\s*Normative language \(MUST\/SHOULD\/MAY\)[^\n]*\n/gm

const stripNormativeNote = ( { content, filename, overviewFile } ) => {
    if( filename === overviewFile ) return content
    return content.replace( NORMATIVE_NOTE_RE, '' )
}

const gradingMetadataFooter = ( { content } ) => {
    const tableMatch = content.match( /(^#\s+.+\n\n)((?:\|.*\n)+)/m )
    if( !tableMatch ) return content

    const tableText = tableMatch[ 2 ]
    const rows = tableText
        .split( '\n' )
        .filter( ( line ) => line.trim().startsWith( '|' ) )
        .map( ( line ) => line.split( '|' ).map( ( cell ) => cell.trim() ) )
        .filter( ( cells ) => cells.length >= 4 )
        .map( ( cells ) => ( { label: cells[ 1 ], value: cells[ 2 ] } ) )
        .filter( ( row ) => row.label !== '' && !/^-+$/.test( row.label ) && row.label.toLowerCase() !== 'field' )

    // Memo 142 (RELATED): merge Depends-on / Related / Annex / Replaced-by into ONE
    // flat "## Related" bullet list (memo-init style) — one bullet per link, deduped
    // by href, no "**Depends on:** / **Related:**" label split. Plain-text cells
    // without links contribute nothing (e.g. an em-dash placeholder).
    const footerRows = rows.filter( ( row ) => FOOTER_LABELS.has( row.label.toLowerCase() ) )
    const seenHrefs = new Set()
    const footerLinks = footerRows
        .flatMap( ( row ) => row.value.match( /\[[^\]]+\]\([^)]+\)/g ) ?? [] )
        .filter( ( link ) => {
            const href = link.slice( link.indexOf( '(' ) )
            if( seenHrefs.has( href ) ) return false
            seenHrefs.add( href )
            return true
        } )
    const footer = footerLinks.length > 0
        ? '\n\n## Related\n\n' + footerLinks.map( ( link ) => `- ${ link }` ).join( '\n' ) + '\n'
        : ''

    // Drop the metadata table, keeping the H1 + blank line.
    let result = content.replace( tableMatch[ 0 ], tableMatch[ 1 ] )
    // Drop the redundant "> **Spec/Status/Changes**" blockquote lines (keep the
    // conformance-language blockquote, which has no leading bold key).
    result = result.replace( /^>\s*\*\*(Spec|Status|Changes)[^\n]*\n/gm, '' )
    // Collapse any blank-line runs left behind near the header.
    result = result.replace( /\n{3,}/g, '\n\n' )

    return result.replace( /\s*$/, '' ) + footer + '\n'
}


const gradingBodyTransform = ( { content, filename } ) => gradingLinkRewrite( { content: gradingMetadataFooter( { content: stripNormativeNote( { content, filename, overviewFile: '00-overview.md' } ) } ) } )


// Memo 108: best-practice link rewrite. The BP source uses relative sibling and
// parent links — "./01-overview.md", "../01-overview.md",
// "./schema-creation/10-readable-interface.md" — which 404 on the site (rendered
// at /best-practice/<slug>/). Rewrite any relative .md link whose basename is an
// NN-prefixed chapter to the in-site route. Absolute http(s) links are left
// untouched (the ":" / "//" break the relative-prefix match). slug = basename
// without the leading "NN-". Mirrors gradingLinkRewrite.
const bestPracticeLinkRewrite = ( { content } ) => {
    return content.replace(
        /\]\((?:\.\.?\/)?(?:[a-z0-9-]+\/)*(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](/best-practice/${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
}

const bestPracticeBodyTransform = ( { content, filename } ) => bestPracticeLinkRewrite( { content: gradingMetadataFooter( { content: stripNormativeNote( { content, filename, overviewFile: '01-overview.md' } ) } ) } )


// Memo 088 PRD-SpecLinks: spec link rewrite. The spec source uses relative
// sibling links "[text](./NN-name.md)" which 404 on the site (rendered at
// /specification/<slug>/). Rewrite them to the in-site route. Anchors are
// preserved. slug = filename without the leading "NN-". Mirrors the grading
// pendant (gradingLinkRewrite) so both families behave consistently.
const specLinkRewrite = ( { content } ) => {
    const result = content.replace(
        /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](/specification/${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
    return result
}


// Memo 088 PRD-Related-Spec + PRD-SpecLinks: spec body transform. First
// gradingMetadataFooter relocates the per-chapter Depends-on/Related table to a
// "## Related" footer (reusing the grading mechanism + FOOTER_LABELS), then
// specLinkRewrite rewrites the relative ./NN-name.md links — including those in
// the new footer — to /specification/<slug>/ routes. Order matters: footer first
// so its links are caught by the rewrite (mirrors gradingBodyTransform).
const specBodyTransform = ( { content, filename } ) => specLinkRewrite( { content: gradingMetadataFooter( { content: stripNormativeNote( { content, filename, overviewFile: '00-overview.md' } ) } ) } )


const identityBodyTransform = ( { content } ) => content


const orderFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d+)-/ )
    return match ? parseInt( match[ 1 ], 10 ) : 999
}


// Memo 087 PRD-01: spec titles are already stripped of "FlowMCP Specification vX — "
// by extractTitle. Grading titles carry an "NN — " prefix (and chapter 00 a
// code-fenced "gradingSpec/..." string). Normalize grading to a clean Starlight
// title so both families render the same.
const identityTitle = ( { title } ) => title

const cleanGradingTitle = ( { title, filename } ) => {
    if( filename === '00-overview.md' ) return 'Overview'
    // Memo 087 PRD-P2-D (F5=A): strip the "NN — " order prefix AND the trailing
    // "(§NN)" section-sign suffix so grading titles read plain like the spec's.
    return title
        .replace( /^\d+\s*[—–-]\s*/, '' )
        .replace( /\s*\(§\d+(?:\.\d+)*\)\s*$/, '' )
        .trim()
}


// Memo 108: best-practice titles. The overview carries a "Best Practice — Overview"
// H1 → clean to the bare nav label; the schema-creation pages carry an "NN — Title"
// prefix → strip it.
const cleanBestPracticeTitle = ( { title, filename } ) => {
    if( filename === '01-overview.md' ) return 'Overview'
    return title.replace( /^\d+\s*[—–-]\s*/, '' ).trim()
}


// Memo 087 PRD-01: spec uses the PROSAIC_FILES set for the `normative` flag.
// Grading chapters declare their status in the metadata table; derive `normative`
// from "| Status | Normative |", falling back to the prosaic set when absent.
const specNormativeFn = ( { filename, prosaicFiles } ) => !prosaicFiles.has( filename )

const gradingNormativeFn = ( { filename, content, prosaicFiles } ) => {
    const statusMatch = content.match( /^\|\s*Status\s*\|\s*([^|]+?)\s*\|/m )
    if( statusMatch ) return /normative/i.test( statusMatch[ 1 ] )
    return !prosaicFiles.has( filename )
}


const buildFrontmatter = ( { filename, title, description, normative, now, sourceCommit, section, versionField, version, sourceRelBase, relPath } ) => {
    const relativeSourcePath = `${ sourceRelBase }/${ relPath ?? filename }`
    const sourceUrl = `https://github.com/FlowMCP/flowmcp-spec/blob/${ sourceCommit }/${ relativeSourcePath }`
    const lines = []
    lines.push( '---' )
    lines.push( `title: "${ escapeYamlString( { value: title } ) }"` )
    lines.push( `description: "${ escapeYamlString( { value: description } ) }"` )
    lines.push( `${ versionField }: "${ version }"` )
    lines.push( `spec_file: "${ filename }"` )
    lines.push( `order: ${ orderFromFilename( { filename } ) }` )
    lines.push( `section: "${ section }"` )
    lines.push( `normative: ${ normative }` )
    lines.push( `source_commit: "${ sourceCommit }"` )
    lines.push( `source_url: "${ sourceUrl }"` )
    lines.push( `generated_at: "${ now }"` )
    lines.push( `generated_from: "${ relativeSourcePath }"` )
    lines.push( `generator: "${ GENERATOR }"` )
    lines.push( `edit_warning: "This file is auto-generated. Source: ${ relativeSourcePath }."` )
    lines.push( '---' )
    return lines.join( '\n' ) + '\n'
}


const generateFile = async ( { filename, relPath, now, sourceCommit, sourceDir, targetDir, prosaicFiles, section, versionField, version, sourceRelBase, titleTransform, normativeFn, bodyTransform } ) => {
    const sourcePath = join( sourceDir, relPath ?? filename )
    const content = await readFile( sourcePath, 'utf-8' )

    const rawTitle = extractTitle( { content } ) || filename
    const title = titleTransform( { title: rawTitle, filename } )
    const description = extractDescription( { content } )
    const normative = normativeFn( { filename, content, prosaicFiles } )

    const frontmatter = buildFrontmatter( { filename, title, description, normative, now, sourceCommit, section, versionField, version, sourceRelBase, relPath } )
    const bodyRewritten = rewriteCrossRefs( { content } )

    // Memo 087 PRD-P2-A/B + Memo 088: pass-specific body transform. Grading
    // relocates metadata to a footer + rewrites relative links to /grading/
    // routes; the spec pass (Memo 088) does the same to /specification/ routes.
    const bodyTransformed = bodyTransform( { content: bodyRewritten, filename } )

    // Memo 059 PRD-008 (D1 + D2 + D5): Strip the leading H1 — Starlight
    // renders the page title from the frontmatter, so the body H1 was a
    // duplicate that also carried a stale "v4.0.0" version string (D2).
    // Removing it eliminates both the duplicated heading and the version
    // inconsistency, and trims the "extra paragraph" feel under the header.
    const body = bodyTransformed.replace( /^#\s+.+?\n+/, '' )

    const output = frontmatter + '\n' + body

    const targetPath = join( targetDir, filename )
    await writeFile( targetPath, output, 'utf-8' )
    return { filename, title, normative, descLength: description.length }
}


// Memo 108: collect doc files for a pass. Non-recursive (spec/grading) returns the
// top-level NN-*.md files. Recursive (best-practice) also descends one level into
// subdirectories (e.g. schema-creation/) and flattens them into the payload — the
// slug routing is by basename, so a flat payload mirrors the grading layout while
// the source keeps the memo's explicit subfolder structure. relPath preserves the
// subdir path for the frontmatter source_url / generated_from.
const collectDocEntries = async ( { sourceDir, recursive } ) => {
    const top = await readdir( sourceDir, { withFileTypes: true } )
    const fileEntries = top
        .filter( ( dirent ) => dirent.isFile() && /^\d{2}-/.test( dirent.name ) && dirent.name.endsWith( '.md' ) )
        .map( ( dirent ) => ( { filename: dirent.name, relPath: dirent.name } ) )
    const subDirs = recursive ? top.filter( ( dirent ) => dirent.isDirectory() ) : []
    const subEntriesNested = await Promise.all( subDirs.map( async ( dirent ) => {
        const subFiles = await readdir( join( sourceDir, dirent.name ) )
        return subFiles
            .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
            .map( ( f ) => ( { filename: f, relPath: `${ dirent.name }/${ f }` } ) )
    } ) )
    return [ ...fileEntries, ...subEntriesNested.flat() ]
        .sort( ( a, b ) => a.filename.localeCompare( b.filename ) )
}


const generatePass = async ( { label, sourceDir, targetDir, prosaicFiles, section, versionField, version, sourceRelBase, now, sourceCommit, titleTransform, normativeFn, bodyTransform, recursive } ) => {
    await mkdir( targetDir, { recursive: true } )
    const docEntries = await collectDocEntries( { sourceDir, recursive: recursive === true } )

    console.log( `Generating ${ label } payload from ${ docEntries.length } files (version=${ version }, source_commit=${ sourceCommit })...` )
    const results = []
    for( const { filename, relPath } of docEntries ) {
        const result = await generateFile( { filename, relPath, now, sourceCommit, sourceDir, targetDir, prosaicFiles, section, versionField, version, sourceRelBase, titleTransform, normativeFn, bodyTransform } )
        results.push( result )
        console.log( `  ✓ ${ relPath } → ${ result.title }` )
    }
    return results
}


const main = async () => {
    let sourceCommit
    try {
        sourceCommit = execSync( 'git rev-parse HEAD', { cwd: REPO } )
            .toString()
            .trim()
            .slice( 0, 7 )
    } catch( err ) {
        console.error( '[ERROR] Failed to determine source_commit via git rev-parse HEAD.' )
        console.error( '[ERROR] Aborting docs-payload generation. Run inside a git repository.' )
        process.exit( 1 )
    }

    const now = new Date().toISOString()

    // --- Spec pass (Memo 088: Related footer + /specification/ link rewrite) ---
    const specResults = await generatePass( {
        label: 'spec',
        sourceDir: SPEC_DIR,
        targetDir: PAYLOAD_DIR,
        prosaicFiles: PROSAIC_FILES,
        section: 'Specification',
        versionField: 'spec_version',
        version: SPEC_VERSION,
        sourceRelBase: `spec/v${ SPEC_VERSION }`,
        now,
        sourceCommit,
        titleTransform: identityTitle,
        normativeFn: specNormativeFn,
        bodyTransform: specBodyTransform
    } )

    console.log( `\nGenerated ${ specResults.length } spec files in ${ PAYLOAD_DIR }` )
    console.log( `Normative: ${ specResults.filter( ( r ) => r.normative ).length }, Prosaic: ${ specResults.filter( ( r ) => !r.normative ).length }` )

    // --- Grading pass (Memo 086 PRD-06 — additive second source) ---
    let gradingResults = []
    let gradingVersion = null
    try {
        const gradingDirs = await readdir( GRADING_ROOT )
        gradingVersion = pickMaxSemverDir( { names: gradingDirs } )
    } catch( err ) {
        console.warn( `\nNo grading/ folder found — skipping grading pass (${ err.message })` )
    }

    if( gradingVersion ) {
        gradingResults = await generatePass( {
            label: 'grading',
            sourceDir: join( GRADING_ROOT, gradingVersion ),
            targetDir: GRADING_PAYLOAD_DIR,
            prosaicFiles: GRADING_PROSAIC_FILES,
            section: 'Grading',
            versionField: 'grading_version',
            version: gradingVersion,
            sourceRelBase: `grading/${ gradingVersion }`,
            now,
            sourceCommit,
            titleTransform: cleanGradingTitle,
            normativeFn: gradingNormativeFn,
            bodyTransform: gradingBodyTransform
        } )
        console.log( `\nGenerated ${ gradingResults.length } grading files in ${ GRADING_PAYLOAD_DIR } (grading_version=${ gradingVersion })` )
    } else {
        console.warn( '\nNo semver grading folder — grading pass skipped.' )
    }

    // --- Best-practice pass (Memo 108 — additive third source, advisory) ---
    let bestPracticeVersion = null
    try {
        const bpDirs = await readdir( BEST_PRACTICE_ROOT )
        bestPracticeVersion = pickMaxSemverDir( { names: bpDirs } )
    } catch( err ) {
        console.warn( `\nNo best-practice/ folder found — skipping best-practice pass (${ err.message })` )
    }

    if( bestPracticeVersion ) {
        const bpResults = await generatePass( {
            label: 'best-practice',
            sourceDir: join( BEST_PRACTICE_ROOT, bestPracticeVersion ),
            targetDir: BEST_PRACTICE_PAYLOAD_DIR,
            prosaicFiles: BEST_PRACTICE_PROSAIC_FILES,
            section: 'Best Practice',
            versionField: 'best_practice_version',
            version: bestPracticeVersion,
            sourceRelBase: `best-practice/${ bestPracticeVersion }`,
            now,
            sourceCommit,
            titleTransform: cleanBestPracticeTitle,
            normativeFn: gradingNormativeFn,
            bodyTransform: bestPracticeBodyTransform,
            recursive: true
        } )
        console.log( `\nGenerated ${ bpResults.length } best-practice files in ${ BEST_PRACTICE_PAYLOAD_DIR } (best_practice_version=${ bestPracticeVersion })` )
    } else {
        console.warn( '\nNo semver best-practice folder — best-practice pass skipped.' )
    }
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
