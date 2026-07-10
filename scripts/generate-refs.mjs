import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'

import { buildStamp } from './lib/build-stamp.mjs'
import { aggregatePath } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = join( __dirname, '..' )
const MANUAL_PATH = join( REPO_ROOT, 'data/refs.manual.json' )
const SCHEMA_PATH = join( REPO_ROOT, 'data/refs.schema.json' )
// Workshop flat layout (Memo 064 FM-S5): the cross-namespace refs aggregate lives at the container
// root, not under a top-level generated/ dir (the public repo's medium-first location).
const RESOLVED_PATH = aggregatePath( { repoRoot: REPO_ROOT, file: 'refs.resolved.json' } )

const IMPORT_REGEX = /^github:FlowMCP\/[\w-]+(#[\w./-]+)?$/


const main = async () => {
    const manualRaw = await readFile( MANUAL_PATH, 'utf-8' )
    const schemaRaw = await readFile( SCHEMA_PATH, 'utf-8' )
    const manual = JSON.parse( manualRaw )
    const schema = JSON.parse( schemaRaw )

    const ajv = new Ajv( { allErrors: true, strict: false } )
    const validate = ajv.compile( schema )
    const valid = validate( manual )

    if( !valid ) {
        const errors = validate.errors
            .map( ( e ) => `[ERROR] ${ e.instancePath || e.params?.missingProperty } — ${ e.message }` )
            .join( '\n' )
        console.error( errors )
        console.error( '[ERROR] Aborting refs.resolved.json generation. Manual review required.' )
        process.exit( 1 )
    }

    const importEntries = Object.entries( manual.imports )
    const importChecks = importEntries
        .map( ( [ key, value ] ) => ( {
            field: `imports.${ key }`,
            regex: IMPORT_REGEX.source,
            ok: IMPORT_REGEX.test( value )
        } ) )

    const importViolations = importChecks.filter( ( c ) => !c.ok )
    if( importViolations.length > 0 ) {
        importViolations.forEach( ( v ) => {
            console.error( `[ERROR] ${ v.field } — does not match ${ v.regex }` )
        } )
        console.error( '[ERROR] Aborting refs.resolved.json generation. Manual review required.' )
        process.exit( 1 )
    }

    const resolvedImports = Object
        .fromEntries( importEntries.map( ( [ key, value ] ) => {
            const [ repoPart, tagPart ] = value.replace( 'github:FlowMCP/', '' ).split( '#' )
            const ref = tagPart || 'main'
            return [
                key,
                {
                    github: value,
                    npmInstallCommand: `npm install -g ${ value }`,
                    browseUrl: `https://github.com/FlowMCP/${ repoPart }/tree/${ ref }`
                }
            ]
        } ) )

    const specVersion = manual.spec.currentVersion
    const specRecommended = manual.spec.recommendedRelease
    const specDir = manual.spec.specDir

    const stamp = buildStamp( { version: specVersion, cwd: REPO_ROOT } )

    const resolved = {
        schemaVersion: 'refs/1.0.0',
        generated: {
            at: stamp.generated_at,
            fromCommit: stamp.sha,
            generator: 'scripts/generate-refs.mjs',
            version: stamp.version,
            sha: stamp.sha,
            generated_at: stamp.generated_at
        },
        spec: {
            currentVersion: specVersion,
            recommendedRelease: specRecommended,
            specDir,
            specDirAbsoluteUrl: `https://github.com/FlowMCP/flowmcp-spec/tree/${ specRecommended }/${ specDir }`,
            llmsTxtUrl: manual.llmsFiles.specUrl,
            miniSkillTemplate: `https://raw.githubusercontent.com/FlowMCP/flowmcp-spec/main/${ manual.spec.miniSkillTemplate }`
        },
        imports: resolvedImports,
        docs: manual.docs,
        github: manual.github,
        llmsFiles: manual.llmsFiles,
        robotsTxt: manual.robotsTxt,
        addons: manual.addons || [],
        validation: {
            passed: true,
            checks: [
                { field: 'spec.currentVersion', regex: '^4\\.\\d+\\.\\d+$', ok: true },
                ...importChecks
            ]
        }
    }

    // Memo 086 PRD-08: additive grading refs (the grading spec is a second,
    // independently versioned standard). Only emitted when present in manual.
    if( manual.grading ) {
        resolved.grading = {
            currentVersion: manual.grading.currentVersion,
            recommendedRelease: manual.grading.recommendedRelease || manual.grading.currentVersion,
            specDir: manual.grading.specDir,
            specDirAbsoluteUrl: `https://github.com/FlowMCP/flowmcp-spec/tree/main/${ manual.grading.specDir }`,
            url: manual.grading.url
        }
    }

    // Memo 108: additive best-practice refs (the third, independently versioned
    // track — advisory, not normative). Only emitted when present in manual.
    if( manual.bestPractice ) {
        resolved.bestPractice = {
            currentVersion: manual.bestPractice.currentVersion,
            recommendedRelease: manual.bestPractice.recommendedRelease || manual.bestPractice.currentVersion,
            specDir: manual.bestPractice.specDir,
            specDirAbsoluteUrl: `https://github.com/FlowMCP/flowmcp-spec/tree/main/${ manual.bestPractice.specDir }`,
            url: manual.bestPractice.url
        }
    }

    await mkdir( dirname( RESOLVED_PATH ), { recursive: true } )
    await writeFile( RESOLVED_PATH, JSON.stringify( resolved, null, 4 ) + '\n', 'utf-8' )

    console.log( `[OK] Wrote ${ RESOLVED_PATH }` )
}


main()
    .catch( ( err ) => {
        console.error( err )
        process.exit( 1 )
    } )
