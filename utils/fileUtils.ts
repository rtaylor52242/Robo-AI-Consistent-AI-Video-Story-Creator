export const getDateString = (): string => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}_${day}_${year}`;
};

export const getFilename = (id: number): string => {
    const idStr = String(id).padStart(3, '0');
    const dateStr = getDateString();
    return `${idStr}_${dateStr}.mp4`;
};

export const getZipFilename = (): string => {
    const dateStr = getDateString();
    return `RobOai_Animation_Tool_${dateStr}.zip`;
};