/* eslint-disable @typescript-eslint/indent */
enum SpreadFlags
{
    None       = 0x0,
    Attributes = 0x1,
    Binds      = 0x2,
    Injections = 0x4,
    Listeners  = 0x8,
}

export default SpreadFlags;