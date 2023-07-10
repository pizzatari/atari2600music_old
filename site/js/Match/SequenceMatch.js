export class SequenceMatch
{
    #list = [];
    #items = [];

    get List() {
        return this.#list;
    }

    get Size() { return this.#list.length; }
    get Count() { return this.#items.length; }

    constructor(inputsArray)
    {
        this.#list = inputsArray;
        this.#items = new Array();
    }

    Add(t)
    {
        this.#items.push(t);

        if (this.#items.length > this.#list.length)
        {
            this.#items.shift();
        }
    }

    IsMatch()
    {
        if (this.#list.length == 0 || this.#list.length != this.#items.length)
            return false;

        for(var i=0; i < this.#list.length; i++)
        {
            if (this.#list[i] != this.#items[i])
                return false;
        }

        return true;
    }

    Clear()
    {
        this.#items.length = 0;
    }

    toString() {
        var outStr = 'SequencMatch: List(' + this.#list.join(',') + ") ";
        outStr += 'Items(' + this.#items.join(',') + ")";
        return outStr;
    }
}
