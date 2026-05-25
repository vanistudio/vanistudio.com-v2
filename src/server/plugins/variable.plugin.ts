export const replaceVariables = (template: string, variables: any) => {
    return template.replace(/{([^{}]+)}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
    });
};
