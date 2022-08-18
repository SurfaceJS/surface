type VirtualDirectory = { [key: `./${string}`]: string | VirtualDirectory; };

export default VirtualDirectory;
