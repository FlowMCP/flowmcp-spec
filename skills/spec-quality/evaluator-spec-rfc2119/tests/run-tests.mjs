#!/usr/bin/env node
// Test runner for evaluator-spec-rfc2119
// Runs check.mjs against three fixtures with known expected grades.
// Exit 0 on PASS, 1 on FAIL.


import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const CHECK_SCRIPT = join( __dirname, '..', 'check.mjs' )
const FIXTURES_DIR = join( __dirname, 'fixtures' )


const EXPECTED = [
    { file: 'grade-5-perfect.md',   expectedGrade: 5, minErrors: 0, maxErrors: 0 },
    { file: 'grade-3-medium.md',    expectedGrade: 3, minErrors: 1, maxErrors: 2 },
    { file: 'grade-1-broken.md',    expectedGrade: 1, minErrors: 4, maxErrors: 99 }
]


const runEvaluator = ( { filePath } ) => {
    return new Promise( ( resolve, reject ) => {
        const child = spawn( 'node', [ CHECK_SCRIPT, '--json', filePath ] )
        let stdout = ''
        let stderr = ''
        child.stdout.on( 'data', ( chunk ) => { stdout += chunk.toString() } )
        child.stderr.on( 'data', ( chunk ) => { stderr += chunk.toString() } )
        child.on( 'close', ( code ) => {
            if( code !== 0 ) {
                reject( new Error( `check.mjs exited with code ${ code }: ${ stderr }` ) )
                return
            }
            try {
                resolve( JSON.parse( stdout ) )
            } catch( error ) {
                reject( new Error( `Invalid JSON output: ${ error.message }\n${ stdout }` ) )
            }
        } )
    } )
}


const main = async () => {
    let passed = 0
    let failed = 0
    const results = []

    for( const expected of EXPECTED ) {
        const filePath = join( FIXTURES_DIR, expected.file )
        try {
            const result = await runEvaluator( { filePath } )
            const errors = result.issues.filter( ( i ) => i.severity === 'error' ).length
            const isGradeMatch = result.grade === expected.expectedGrade
            const isErrorRangeOk = errors >= expected.minErrors && errors <= expected.maxErrors
            const isPass = isGradeMatch && isErrorRangeOk

            results.push( {
                file: expected.file,
                expected: expected.expectedGrade,
                actual: result.grade,
                errors,
                pass: isPass
            } )

            if( isPass ) {
                passed++
                console.log( `PASS  ${ expected.file }: grade=${ result.grade } (expected ${ expected.expectedGrade }), ${ errors } errors` )
            } else {
                failed++
                console.log( `FAIL  ${ expected.file }: grade=${ result.grade } (expected ${ expected.expectedGrade }), ${ errors } errors (range ${ expected.minErrors }-${ expected.maxErrors })` )
            }
        } catch( error ) {
            failed++
            console.log( `ERROR ${ expected.file }: ${ error.message }` )
        }
    }

    console.log( '' )
    console.log( `Tests: ${ passed } passed, ${ failed } failed (${ passed + failed } total)` )

    if( failed > 0 ) process.exit( 1 )
    process.exit( 0 )
}


main()
