import { Dataset, Table } from "@google-cloud/bigquery";

// DELAY
const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// CHECKING DB
export async function createTableIfNotExists(
  dataset: Dataset,
  tableName: string,
  schema: { name: string; type: string; mode: string }[],
  maxRetries: number = 3
): Promise<Table> {
  const table = dataset.table(tableName);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [exists] = await table.exists();

      if (!exists) {
        const [createdTable] = await dataset.createTable(tableName, { schema });
        console.log(`Tabela ${tableName} criada`);
        await delay(10000); // Wait for 1 second before proceeding
        return createdTable;
      } else {
        return table;
      }
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(
          `Failed to create table ${tableName} after ${maxRetries} attempts.`
        );
        throw error;
      } else {
        console.warn(
          `Attempt ${attempt} to create table ${tableName} failed. Retrying...`
        );
        await delay(1000 * attempt); // Wait for an increasing delay before retrying
      }
    }
  }

  throw new Error(
    `Failed to create or access table ${tableName} after ${maxRetries} attempts.`
  );
}
