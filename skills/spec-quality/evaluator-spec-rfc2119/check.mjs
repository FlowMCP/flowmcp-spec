#!/usr/bin/env node
// evaluator-spec-rfc2119 — deterministic checker
// Checks a FlowMCP spec file against RFC2119/BCP14/RFC8174 conformance rules.
// Returns JSON { grade, issues, summary }.
//
// Usage:
//   node check.mjs --json path/to/file.md
//   node check.mjs --json --file=path/to/file.md
//
// See SKILL.md for rule catalog and grading scale.


import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'


const KEYWORDS = [ 'MUST', 'SHALL', 'SHOULD', 'MAY', 'REQUIRED', 'RECOMMENDED', 'OPTIONAL' ]
const LOWERCASE_NORMATIVE = [ 'must', 'shall', 'should', 'may' ]

// Files in spec/v{X.Y.Z}/ that are explicitly prosaic (no normative language expected).
// These are exempt from RFC-001 and RFC-006.
const PROSAIC_FILES = [
    '00-overview.md',
    '08-migration.md',
    '21-schema-lifecycle.md',
    'README.md'
]

const STYLE_FILLER_PATTERNS = [
    /\bwe\s+must\s+remember\b/i,
    /\bit\s+should\s+be\s+clear\b/i,
    /\bone\s+may\s+note\b/i,
    /\bshould\s+be\s+obvious\b/i,
    /\bmust\s+be\s+noted\b/i
]


const isProsaicFile = ( { fileName } ) => {
    return PROSAIC_FILES.includes( fileName )
}


const checkRFC001 = ( { lines, fileName } ) => {
    if( isProsaicFile( { fileName } ) ) return []

    const issues = []
    const firstTen = lines.slice( 0, 10 ).join( '\n' )
    const hasNote = /Normative language.*follows the conventions defined in/.test( firstTen )
    if( !hasNote ) {
        issues.push( {
            severity: 'error',
            code: 'RFC-001',
            line: 1,
            message: 'Normative file does not reference Conformance Block in 00-overview.md (expected blockquote within first 10 lines)'
        } )
    }
    return issues
}


const checkRFC002 = ( { lines } ) => {
    const issues = []
    // Detect obvious mixed-case keywords (mid-word inconsistency only).
    // Title-case "Must"/"Should"/"May" at the start of sentences or table cells
    // is left to RFC-003 (warning) — it is judgement-call territory.
    lines.forEach( ( line, idx ) => {
        const codeBlockSkip = /^(\s{4,}|\t|```)/.test( line )
        if( codeBlockSkip ) return
        const matches = line.match( /\b(mUsT|MuSt|mUST|sHOuLD|sHOULD|mAY)\b/g ) || []
        matches.forEach( ( match ) => {
            issues.push( {
                severity: 'error',
                code: 'RFC-002',
                line: idx + 1,
                message: `Mixed-case keyword "${ match }" — RFC2119 keywords MUST be all uppercase or removed`
            } )
        } )
    } )
    return issues
}


const checkRFC003 = ( { lines } ) => {
    const issues = []
    lines.forEach( ( line, idx ) => {
        const codeBlockSkip = /^(\s{4,}|\t|```)/.test( line )
        if( codeBlockSkip ) return
        const isStyleFiller = STYLE_FILLER_PATTERNS.some( ( pattern ) => pattern.test( line ) )
        if( isStyleFiller ) return  // handled by RFC-007

        // Pattern: any noun + lowercase normative keyword + verb (a sentence-like structure)
        // We deliberately catch "schema must", "A schema must", "Tools should", etc.
        // Style-fillers like "we must remember" are caught by RFC-007 above and skipped here.
        const matches = line.match( /\b\w+\s+(must|shall|should|may)\s+\w+/g ) || []
        matches.forEach( ( match ) => {
            const keyword = match.split( /\s+/ ).find( ( w ) => LOWERCASE_NORMATIVE.includes( w ) )
            if( !keyword ) return
            // Skip if the match itself contains a pronoun-as-subject (these are usually conversational)
            if( /^(?:i|we|you|they|it)\s/i.test( match ) ) return
            issues.push( {
                severity: 'warning',
                code: 'RFC-003',
                line: idx + 1,
                message: `Lowercase "${ keyword }" in normative context: consider uppercase ${ keyword.toUpperCase() }`
            } )
        } )
    } )
    return issues
}


const checkRFC004 = ( { lines } ) => {
    const issues = []
    lines.forEach( ( line, idx ) => {
        const codeBlockSkip = /^(\s{4,}|\t|```)/.test( line )
        if( codeBlockSkip ) return
        // Pattern: keyword at sentence start (uppercase MUST/SHOULD/MAY without antecedent)
        // Match: ". MUST X" or "^MUST X"
        const matches = line.match( /(?:^|\.\s+)(MUST|SHOULD|MAY|SHALL)\s+(?!NOT)\w+/g ) || []
        matches.forEach( ( match ) => {
            issues.push( {
                severity: 'warning',
                code: 'RFC-004',
                line: idx + 1,
                message: `Keyword "${ match.trim() }" lacks antecedent subject — RFC2119 verb pattern requires "<subject> MUST <verb>"`
            } )
        } )
    } )
    return issues
}


const checkRFC005 = ( { lines } ) => {
    const issues = []
    lines.forEach( ( line, idx ) => {
        const codeBlockSkip = /^(\s{4,}|\t|```)/.test( line )
        if( codeBlockSkip ) return
        const negationMatches = line.match( /\b(MUSTNOT|SHALLNOT|MUST-NOT|SHALL-NOT|mustn['']t|shouldn['']t)\b/g ) || []
        negationMatches.forEach( ( match ) => {
            issues.push( {
                severity: 'error',
                code: 'RFC-005',
                line: idx + 1,
                message: `Negation "${ match }" — RFC2119 requires "MUST NOT" or "SHALL NOT" with a space`
            } )
        } )
    } )
    return issues
}


const checkRFC006 = ( { lines, fileName } ) => {
    if( isProsaicFile( { fileName } ) ) return []

    const issues = []
    // Check: does the file have the conformance boilerplate within first 10 lines?
    // If RFC-001 already flagged it, RFC-006 is redundant — but we double-check from a structural angle.
    const firstTen = lines.slice( 0, 10 ).join( '\n' )
    const hasBoilerplate = /^>\s+Normative language/m.test( firstTen )
    if( !hasBoilerplate ) {
        issues.push( {
            severity: 'error',
            code: 'RFC-006',
            line: 1,
            message: 'Normative file lacks the conformance boilerplate blockquote (expected at the top, after H1)'
        } )
    }
    return issues
}


const checkRFC007 = ( { lines } ) => {
    const issues = []
    lines.forEach( ( line, idx ) => {
        const codeBlockSkip = /^(\s{4,}|\t|```)/.test( line )
        if( codeBlockSkip ) return
        STYLE_FILLER_PATTERNS.forEach( ( pattern ) => {
            if( pattern.test( line ) ) {
                const match = line.match( pattern )?.[ 0 ]
                issues.push( {
                    severity: 'hint',
                    code: 'RFC-007',
                    line: idx + 1,
                    message: `Style-filler "${ match }" — rephrase to avoid normative keyword used as English filler`
                } )
            }
        } )
    } )
    return issues
}


const checkRFC008 = ( { lines } ) => {
    const issues = []
    lines.forEach( ( line, idx ) => {
        // Detect cross-refs that look like "see X" where X is not the canonical format
        // Canonical: "see NN-name.md" or "[NN-name.md](./NN-name.md)"
        const seeMatches = line.match( /\bsee\s+([A-Za-z0-9_-]+)/g ) || []
        seeMatches.forEach( ( match ) => {
            const target = match.replace( /^see\s+/i, '' )
            // Skip if it matches canonical format NN-name (numbers, dash, lowercase)
            if( /^\d{2}-[a-z][a-z0-9-]*$/.test( target ) ) return
            // Skip if it's a code reference like VAL016
            if( /^(VAL|AGT|RES|SKL|SEL|RFC|DEP|SEC|LST|PRM|CAT|ID|PH|TST)\d+/.test( target ) ) return
            // Skip if it's a uppercase acronym (e.g. "see RFC2119")
            if( /^[A-Z]{2,}/.test( target ) ) return
            // Skip if it's part of a sentence (verb form)
            if( /^(if|that|this|how|what|why|whether|the)$/i.test( target ) ) return

            issues.push( {
                severity: 'hint',
                code: 'RFC-008',
                line: idx + 1,
                message: `Cross-reference "${ match }" — canonical format is "see NN-name.md" (e.g. "see 14-skills.md")`
            } )
        } )
    } )
    return issues
}


const computeGrade = ( { issues } ) => {
    let grade = 5
    issues.forEach( ( issue ) => {
        if( issue.severity === 'error' ) grade -= 1.0
        else if( issue.severity === 'warning' ) grade -= 0.25
    } )
    grade = Math.max( 1, Math.round( grade ) )
    return grade
}


const buildSummary = ( { issues, grade } ) => {
    const errors = issues.filter( ( i ) => i.severity === 'error' ).length
    const warnings = issues.filter( ( i ) => i.severity === 'warning' ).length
    const hints = issues.filter( ( i ) => i.severity === 'hint' ).length
    const parts = []
    if( errors > 0 ) parts.push( `${ errors } error${ errors > 1 ? 's' : '' }` )
    if( warnings > 0 ) parts.push( `${ warnings } warning${ warnings > 1 ? 's' : '' }` )
    if( hints > 0 ) parts.push( `${ hints } hint${ hints > 1 ? 's' : '' }` )
    if( parts.length === 0 ) return `grade ${ grade } — no issues`
    return `${ parts.join( ', ' ) } — grade ${ grade }`
}


const evaluateFile = async ( { filePath } ) => {
    const content = await readFile( filePath, 'utf-8' )
    const lines = content.split( '\n' )
    const fileName = basename( filePath )

    const issues = [
        ...checkRFC001( { lines, fileName } ),
        ...checkRFC002( { lines } ),
        ...checkRFC003( { lines } ),
        ...checkRFC004( { lines } ),
        ...checkRFC005( { lines } ),
        ...checkRFC006( { lines, fileName } ),
        ...checkRFC007( { lines } ),
        ...checkRFC008( { lines } )
    ]

    // RFC-006 is redundant with RFC-001 — if both fire, keep only RFC-001 (more specific)
    const deduplicated = issues.filter( ( issue, idx, arr ) => {
        if( issue.code !== 'RFC-006' ) return true
        const hasRFC001 = arr.some( ( other ) => other.code === 'RFC-001' && other.line === issue.line )
        return !hasRFC001
    } )

    // Sort by line number
    deduplicated.sort( ( a, b ) => a.line - b.line )

    const grade = computeGrade( { issues: deduplicated } )
    const summary = buildSummary( { issues: deduplicated, grade } )

    return { grade, issues: deduplicated, summary }
}


const parseArgs = ( { argv } ) => {
    const args = { json: false, filePath: null }
    for( const arg of argv.slice( 2 ) ) {
        if( arg === '--json' ) args.json = true
        else if( arg.startsWith( '--file=' ) ) args.filePath = arg.slice( '--file='.length )
        else if( !arg.startsWith( '--' ) ) args.filePath = arg
    }
    return args
}


const main = async () => {
    const { json, filePath } = parseArgs( { argv: process.argv } )

    if( !filePath ) {
        console.error( 'Usage: node check.mjs [--json] <file.md>' )
        process.exit( 2 )
    }

    try {
        const result = await evaluateFile( { filePath } )
        if( json ) {
            console.log( JSON.stringify( result, null, 4 ) )
        } else {
            console.log( `File:    ${ filePath }` )
            console.log( `Grade:   ${ result.grade } / 5` )
            console.log( `Summary: ${ result.summary }` )
            if( result.issues.length > 0 ) {
                console.log( '' )
                console.log( 'Issues:' )
                result.issues.forEach( ( issue ) => {
                    console.log( `  [${ issue.severity.toUpperCase() }] ${ issue.code } (line ${ issue.line }): ${ issue.message }` )
                } )
            }
        }
        process.exit( 0 )
    } catch( error ) {
        console.error( `Error evaluating ${ filePath }: ${ error.message }` )
        process.exit( 1 )
    }
}


main()
