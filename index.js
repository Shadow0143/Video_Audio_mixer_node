const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

async function addMusicToVideo(inputVideoUrl, outputVideoUrl, music) {
    try {

        ffmpeg.setFfmpegPath(ffmpegInstaller.path);

        return await new Promise((resolve, reject) => {
            const ffmpegCommand = ffmpeg()
                .input(inputVideoUrl)
                .input(music)
                .audioCodec('aac') // Or 'libvorbis', 'libmp3lame'
                .toFormat('mp4')
                .outputOptions('-shortest')
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('Error mixing audio and video:', err);
                    reject(err);
                })
                .on('progress', (progress) => {
                    console.log('Progress:', progress.percent);
                });
            ffmpegCommand.save(outputVideoUrl);
        });
    } catch (error) {
        console.error('Error during FFmpeg installation or execution:', error);
        throw error;
    }
}

(async () => {
    try {
        const inputVideoUrl = './video2.mp4';
        const audioUrl = './audio.mp3';
        const videoWithMusic = await addMusicToVideo(inputVideoUrl, 'outputWithSound.mp4', audioUrl);
        console.log('Video with music created:', videoWithMusic);
    } catch (error) {
        console.error('Error during video processing:', error);
    }
})();

module.exports = {
    addMusicToVideo,
};
