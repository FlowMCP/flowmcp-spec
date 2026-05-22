export function buildFrontmatter( { generator, sources, specVersion } ) {
    const generatedAt = new Date().toISOString()
    const sourceList = sources.map( ( s ) => `  - ${s}` ).join( '\n' )
    return [
        '---',
        `generated_at: ${generatedAt}`,
        `generator: ${generator}`,
        `spec_version: ${specVersion}`,
        'generated_from:',
        sourceList,
        'edit_warning: DO NOT EDIT — regenerate via scripts/generators/regen-all.mjs',
        '---',
        ''
    ].join( '\n' )
}
