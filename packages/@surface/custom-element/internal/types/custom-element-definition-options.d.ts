type CustomElementDefinitionOptions = ElementDefinitionOptions &
{
    directives?: Record<string, DirectiveEntry>,
    style?:      string,
    template?:   string,
};

export default CustomElementDefinitionOptions;