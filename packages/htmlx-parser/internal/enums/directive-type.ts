/* eslint-disable @typescript-eslint/indent */
enum DirectiveType
{
    Else             = "#else",
    ElseIf           = "#else-if",
    For              = "#for",
    If               = "#if",
    Inject           = "#inject",
    InjectKey        = "#inject.key",
    InjectScope      = "#inject.scope",
    Placeholder      = "#placeholder",
    PlaceholderKey   = "#placeholder.key",
    PlaceholderScope = "#placeholder.scope"
}

export default DirectiveType;

