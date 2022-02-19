/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable max-statements-per-line */
declare module "*.css"        { const value: string; export default value; }
declare module "*.css?style"  { const value: string; export default value; }
declare module "*.htmlx"      { const value: import("@surface/htmlx").TemplateFactory; export default value; }
declare module "*.scss"       { const value: string; export default value; }
declare module "*.scss?style" { const value: string; export default value; }
declare module "*.txt"        { const value: string; export default value; }