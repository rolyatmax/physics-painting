export default function createRandom(randNumGenerator = Math.random) {
    return (low, high) => {
        if (high === undefined) {
            high = low;
            low = 0;
        }
        return randNumGenerator() * (high - low) + low | 0;
    };
}
