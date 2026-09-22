window.memory = function (address) {
    this.basePtr = address;
    this.dataPtr = 0;
    this.allocate = function (size) {
        if (this.dataPtr > 0x10000 || this.dataPtr + size > 0x10000)
            return -1;
        var memAddr = this.basePtr.add32(this.dataPtr);
        this.dataPtr += size;
        return memAddr;
    };
    this.clear = function () {
        for (var i = 0; i < 0x10000; i += 8)
            p.write8(this.basePtr.add32(i), 0);
    };
    this.clear();
    return this;
};