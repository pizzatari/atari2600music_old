import { MusicConfig } from "./Music.js"

export class MusicScale {
    #musicConfig = null;

    constructor(musicConfig = null) {
        if (musicConfig == null)
            this.#musicConfig = new MusicConfig();
        else
            this.#musicConfig = musicConfig;
    }

    get Config() { return this.#musicConfig }
    set Config(cfg) { this.#musicConfig = cfg }

    getNotes() { return [] }
}
