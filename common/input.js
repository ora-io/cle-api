function trimPrefix(str, prefix) {
    if (str.startsWith(prefix)) {
        str = str.substring(prefix.length);
    }
    return str;
}

export class Input{
    inputStr=['',''];
    
    static privateId = 0
    static publicId = 1


    getPrivateInputStr(){
        return this.inputStr[Input.privateId]
    }

    getPublicInputStr(){
        return this.inputStr[Input.publicId]
    }

    formatIntInput(input) {
        return `0x${input.toString(16)}:i64 `;
    }

    formatHexStringInput(input) {
        return `0x${trimPrefix(input, "0x")}:bytes-packed `;
    }

    formatVarLenInput(input) {
        var inp = trimPrefix(input, "0x");
        var formatted = `${this.formatIntInput(
            Math.ceil(inp.length / 2),
        )}${this.formatHexStringInput(inp)}`;
        return formatted;
    }
    
    addInt(input, isPublic){
        this.inputStr[isPublic ? Input.publicId : Input.privateId] += this.formatIntInput(input)
    }

    addHexString(input, isPublic) {
        this.inputStr[isPublic ? Input.publicId : Input.privateId] += this.formatHexStringInput(input)
    }

    addVarLenHexString(input, isPublic) {
        this.inputStr[isPublic ? Input.publicId : Input.privateId] += this.formatVarLenInput(input)
    }

    // ['0xaa', '0xbbbb', '0xcccccc']
    addVarLenHexStringArray(input, isPublic) {
        this.inputStr[isPublic ? Input.publicId : Input.privateId] += this.formatIntInput(input.length)
        for (let i = 0; i < input.length; i ++){
            this.inputStr[isPublic ? Input.publicId : Input.privateId] += this.formatVarLenInput(input[i])
        }
    }
}
