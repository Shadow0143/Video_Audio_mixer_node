const { spawn } = require('child_process');
const fs = require('fs');

async function addMusicToVideo(inputVideoPath, outputVideoPath, musicBuffer) {
    try {
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

        const ffmpegProcess = spawn(ffmpegPath, [
            '-i', inputVideoPath,
            '-i', 'pipe:0', // Use stdin for the audio input
            '-map', '0:v', '-map', '1:a', // Keep video from input file and audio from the pipe
            '-c:v', 'copy', // Copy video codec
            '-c:a', 'aac', // Set audio codec to AAC
            '-shortest',
            outputVideoPath
        ]);

        ffmpegProcess.stdin.on('error', (error) => {
            if (error.code === 'EPIPE') {
                // Ignore EPIPE error, it means FFmpeg finished reading from stdin
            } else {
                console.error('Error writing to FFmpeg stdin:', error);
            }
        });

        ffmpegProcess.stderr.on('data', (data) => {
            console.error(`FFmpeg stderr: ${data}`);
        });

        ffmpegProcess.stdin.write(musicBuffer);
        ffmpegProcess.stdin.end();

        return new Promise((resolve, reject) => {
            ffmpegProcess.on('exit', (code, signal) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`FFmpeg process exited with code ${code} and signal ${signal}`));
                }
            });

            ffmpegProcess.on('error', (error) => {
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error during FFmpeg execution:', error);
        throw error;
    }
}

(async () => {
    try {

        const randomNumber = Math.random();
        const inputVideoPath = './video2.mp4';
        const audioBuffer = fs.readFileSync('./audio2.mp3'); // Read audio file into buffer

        console.log('audioBuffer =============',audioBuffer);
        await addMusicToVideo(inputVideoPath, `outputWithSound + ${randomNumber}.mp4`, audioBuffer);
    } catch (error) {
        console.error('Error during video processing:', error);
    }
})();

module.exports = {
    addMusicToVideo,
};
