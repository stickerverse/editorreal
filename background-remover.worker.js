self.onmessage = function(e) {
    const { imageData, threshold, smoothing, featherRadius } = e.data;

    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const mask = new Uint8Array(width * height);
    const visited = new Uint8Array(width * height);

    // --- Flood fill ---
    function floodFill(startX, startY) {
        const stack = [{ x: startX, y: startY }];
        const startIdx = startY * width + startX;
        if (startIdx < 0 || startIdx >= data.length / 4) return;

        const startColor = {
            r: data[startIdx * 4],
            g: data[startIdx * 4 + 1],
            b: data[startIdx * 4 + 2]
        };
        const scaledThreshold = (threshold / 100) * 255;

        let processedCount = 0;
        while (stack.length > 0) {
            const { x, y } = stack.pop();

            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const idx = y * width + x;
            if (visited[idx]) continue;
            visited[idx] = 1;

            const pixelIdx = idx * 4;
            const currentColor = {
                r: data[pixelIdx],
                g: data[pixelIdx + 1],
                b: data[pixelIdx + 2]
            };

            const dr = currentColor.r - startColor.r;
            const dg = currentColor.g - startColor.g;
            const db = currentColor.b - startColor.b;
            const distance = Math.sqrt(dr * dr + dg * dg + db * db);

            if (distance <= scaledThreshold) {
                mask[idx] = 255;
                stack.push({ x: x + 1, y: y });
                stack.push({ x: x - 1, y: y });
                stack.push({ x: x, y: y + 1 });
                stack.push({ x: x, y: y - 1 });
            }

            processedCount++;
            if (processedCount % 10000 === 0) {
                // Optional: post progress update during flood fill
            }
        }
    }

    self.postMessage({ type: 'progress', progress: 10, message: 'Analyzing edges...' });

    const samplePoints = [
        { x: 0, y: 0 }, { x: width - 1, y: 0 }, { x: 0, y: height - 1 }, { x: width - 1, y: height - 1 },
        { x: Math.floor(width / 2), y: 0 }, { x: Math.floor(width / 2), y: height - 1 },
        { x: 0, y: Math.floor(height / 2) }, { x: width - 1, y: Math.floor(height / 2) }
    ];

    samplePoints.forEach(point => {
        if (!visited[point.y * width + point.x]) {
            floodFill(point.x, point.y);
        }
    });

    self.postMessage({ type: 'progress', progress: 50, message: 'Inverting mask...' });
    for (let i = 0; i < mask.length; i++) {
        mask[i] = mask[i] === 255 ? 0 : 255;
    }

    // --- Smoothing ---
    if (smoothing > 0) {
        self.postMessage({ type: 'progress', progress: 60, message: 'Smoothing mask...' });
        let temp = new Uint8Array(mask);
        for (let s = 0; s < smoothing; s++) {
            // Erosion
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    let min = 255;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            min = Math.min(min, temp[(y + dy) * width + (x + dx)]);
                        }
                    }
                    mask[idx] = min;
                }
            }
            temp.set(mask);
            // Dilation
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    let max = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            max = Math.max(max, temp[(y + dy) * width + (x + dx)]);
                        }
                    }
                    mask[idx] = max;
                }
            }
            temp.set(mask);
            self.postMessage({ type: 'progress', progress: 60 + (s + 1) * (20 / smoothing), message: 'Smoothing...' });
        }
    }

    // --- Feathering ---
    if (featherRadius > 0) {
        self.postMessage({ type: 'progress', progress: 85, message: 'Feathering edges...' });
        const feathered = new Uint8Array(mask);
        for (let y = featherRadius; y < height - featherRadius; y++) {
            for (let x = featherRadius; x < width - featherRadius; x++) {
                const idx = y * width + x;
                let sum = 0, weightSum = 0;
                for (let dy = -featherRadius; dy <= featherRadius; dy++) {
                    for (let dx = -featherRadius; dx <= featherRadius; dx++) {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= featherRadius) {
                            const weight = 1 - (dist / featherRadius);
                            sum += mask[(y + dy) * width + (x + dx)] * weight;
                            weightSum += weight;
                        }
                    }
                }
                feathered[idx] = Math.round(sum / weightSum);
            }
        }
        mask.set(feathered);
    }

    self.postMessage({ type: 'progress', progress: 95, message: 'Finalizing image...' });

    const outputImage = new ImageData(width, height);
    for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        outputImage.data[i] = data[i];
        outputImage.data[i + 1] = data[i + 1];
        outputImage.data[i + 2] = data[i + 2];
        outputImage.data[i + 3] = mask[idx];
    }

    self.postMessage({ type: 'result', result: outputImage });
};
