import prisma from '@/lib/prisma';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
    level: LogLevel;
    message: string;
    source: string;
    metadata?: any;
}

/**
 * Asynchronous logger that saves to the database.
 * We deliberately do NOT await the prisma call to avoid blocking the main thread.
 * (Fire and forget style, but with error catching)
 */
export const logger = {
    info: (message: string, source: string, metadata?: any) => {
        logToDb({ level: 'INFO', message, source, metadata });
        console.log(`[INFO] [${source}] ${message}`, metadata ? JSON.stringify(metadata) : '');
    },

    warn: (message: string, source: string, metadata?: any) => {
        logToDb({ level: 'WARN', message, source, metadata });
        console.warn(`[WARN] [${source}] ${message}`, metadata ? JSON.stringify(metadata) : '');
    },

    error: (message: string, source: string, metadata?: any) => {
        logToDb({ level: 'ERROR', message, source, metadata });
        console.error(`[ERROR] [${source}] ${message}`, metadata);
    }
};

async function logToDb(entry: LogEntry) {
    try {
        // Convert metadata to JSON if it's an object/error, or keep as is
        let safeMetadata = entry.metadata;

        if (entry.metadata instanceof Error) {
            safeMetadata = {
                name: entry.metadata.name,
                message: entry.metadata.message,
                stack: entry.metadata.stack
            };
        }

        await prisma.systemLog.create({
            data: {
                level: entry.level,
                message: entry.message,
                source: entry.source,
                metadata: safeMetadata ? JSON.parse(JSON.stringify(safeMetadata)) : undefined
            }
        });
    } catch (err) {
        // Fallback: If DB logging fails, at least print to console so we don't lose it entirely
        console.error('FAILED TO SAVE LOG TO DB:', err);
    }
}
