/// <reference types="source-map-js" />
declare const pluginTailwindcssLit: () => Promise<{
    name: string;
    transform(code: any, id: any): Promise<{
        code: string;
        map: {
            version: number;
            sources: string[];
            names: string[];
            sourceRoot?: string;
            sourcesContent?: string[];
            mappings: string;
            file: string;
        };
    } | {
        code: string;
        map: import("source-map-js").RawSourceMap;
    }>;
}>;
export default pluginTailwindcssLit;
