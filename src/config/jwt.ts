export const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if(!secret || secret.trim() === '') {
        throw new Error('FATAL: Environment variable JWT_SECRET wajib diisi sebelum menjalankan server.');
    }
    return secret;
}