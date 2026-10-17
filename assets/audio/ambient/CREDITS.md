# Ambient recordings

These recordings are downloaded only when a visitor chooses Play. The adapted
MP3 files retain each original recording's license, independently of the site's
code. Brown noise and soft noise are original generated loops and use no recording.

| File | Original recording | Author | License |
| --- | --- | --- | --- |
| jungle.mp3 | [Jungle Sound Thailand Phuket](https://commons.wikimedia.org/wiki/File:Jungle_Sound_Thailand_Phuket.flac) | Amada44 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| rain.mp3 | [Heavy rain in Glenshaw, PA](https://commons.wikimedia.org/wiki/File:Heavy_rain_in_Glenshaw,_PA.ogg) | Sage Ross | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| river.mp3 | [James River Rapids 1](https://commons.wikimedia.org/wiki/File:James_River_Rapids_1.ogg) | Jarrod stanley (JD Savanyu) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| wind.mp3 | [Howling wind](https://commons.wikimedia.org/wiki/File:Howling_wind.ogg) | Tvabutzku1234 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

Changes: excerpts (jungle 1–47 s, rain and river 20–204 s, wind 3–127 s), mono,
DC removal, volume balancing with an 0.8 peak ceiling, resampling to 24 kHz,
and 64 kbps MP3 compression. Playback uses the browser's native looping audio player. No audio samples are
generated, copied, or crossfaded by page scripts during playback.

`brown.wav` and `soft.wav` are mono, 24 kHz, 16-bit, 18-second loops generated
by `scripts/build_ambient_noise.py`. Their filtering and equal-power loop joins
are baked into the files. These original generated sounds are CC0.

Files load only after Play. Pause retains the browser's playback position; Stop
unloads the source. Recordings and license links are also credited in the
player's Info panel.
