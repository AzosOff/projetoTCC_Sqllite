import * as SQLite from 'expo-sqlite';

const DB_NAME = 'clinica.db';

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};

export const migrateDbIfNeeded = async (): Promise<void> => {
  const db = await getDatabase();
  
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');
  
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;
  
  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        idade TEXT NOT NULL,
        numero TEXT NOT NULL
      );
    `);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        tipo TEXT NOT NULL,
        id_paciente INTEGER NOT NULL,
        FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON DELETE CASCADE
      );
    `);
    
    await db.execAsync('PRAGMA user_version = 1');
  }
};

export interface Paciente {
  id: number;
  nome: string;
  email: string;
  idade: string;
  numero: string;
}

export interface Agendamento {
  id: number;
  data: string;
  tipo: string;
  id_paciente: number;
  nome_paciente?: string;
}

export const getAllPacientes = async (): Promise<Paciente[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Paciente>('SELECT * FROM pacientes ORDER BY nome');
};

export const getPacienteById = async (id: number): Promise<Paciente | null> => {
  const db = await getDatabase();
  return await db.getFirstAsync<Paciente>('SELECT * FROM pacientes WHERE id = ?', [id]);
};

export const createPaciente = async (nome: string, email: string, idade: string, numero: string): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO pacientes (nome, email, idade, numero) VALUES (?, ?, ?, ?)',
    [nome, email, idade, numero]
  );
  return result.lastInsertRowId;
};

export const updatePaciente = async (id: number, nome: string, email: string, idade: string, numero: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE pacientes SET nome = ?, email = ?, idade = ?, numero = ? WHERE id = ?',
    [nome, email, idade, numero, id]
  );
};

export const deletePaciente = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pacientes WHERE id = ?', [id]);
};

export const searchPacientes = async (searchText: string): Promise<Paciente[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Paciente>(
    'SELECT * FROM pacientes WHERE nome LIKE ? ORDER BY nome',
    [`%${searchText}%`]
  );
};

export const getAllAgendamentos = async (): Promise<Agendamento[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Agendamento>(`
    SELECT agendamentos.*, pacientes.nome as nome_paciente 
    FROM agendamentos 
    LEFT JOIN pacientes ON agendamentos.id_paciente = pacientes.id 
    ORDER BY agendamentos.data ASC
  `);
};

export const getAgendamentoById = async (id: number): Promise<Agendamento | null> => {
  const db = await getDatabase();
  return await db.getFirstAsync<Agendamento>(`
    SELECT agendamentos.*, pacientes.nome as nome_paciente 
    FROM agendamentos 
    LEFT JOIN pacientes ON agendamentos.id_paciente = pacientes.id 
    WHERE agendamentos.id = ?
  `, [id]);
};

export const createAgendamento = async (data: string, tipo: string, id_paciente: number): Promise<number> => {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO agendamentos (data, tipo, id_paciente) VALUES (?, ?, ?)',
    [data, tipo, id_paciente]
  );
  return result.lastInsertRowId;
};

export const updateAgendamento = async (id: number, data: string, tipo: string, id_paciente: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE agendamentos SET data = ?, tipo = ?, id_paciente = ? WHERE id = ?',
    [data, tipo, id_paciente, id]
  );
};

export const deleteAgendamento = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM agendamentos WHERE id = ?', [id]);
};