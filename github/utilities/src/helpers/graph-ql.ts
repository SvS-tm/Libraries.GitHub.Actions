export function minify(query: string)
{
    return query
        .replaceAll(/(\s|\t|\n)+/g, " ");
}