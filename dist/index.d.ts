interface MyModifiedRawSourceMap {
    version: number;
    sources: string[];
    names: string[];
    sourcesContent?: string[];
    mappings: string;
}
declare const pluginTailwindcssLit: () => Promise<{
    name: string;
    transform(code: any, id: any): Promise<{
        code: string;
        map: MyModifiedRawSourceMap;
    }>;
}>;
export default pluginTailwindcssLit;
