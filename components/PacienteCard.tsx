import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Paciente } from '../database/initDatabase';

interface PacienteCardProps {
  paciente: Paciente;
  onEdit: (paciente: Paciente) => void;
  onDelete: (id: number) => void;
}

export const PacienteCard: React.FC<PacienteCardProps> = ({ paciente, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.nome}>{paciente.nome}</Text>
        <Text style={styles.info}>📧 {paciente.email}</Text>
        <Text style={styles.info}>🎂 Idade: {paciente.idade}</Text>
        <Text style={styles.info}>📱 {paciente.numero}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(paciente)}>
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(paciente.id)}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6c3ce0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  content: { flex: 1 },
  nome: { fontSize: 18, fontWeight: '600', color: '#1a1a2e', marginBottom: 6 },
  info: { fontSize: 14, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'column', gap: 8 },
  editButton: { padding: 8, borderRadius: 8, backgroundColor: '#f0edff' },
  editText: { fontSize: 18 },
  deleteButton: { padding: 8, borderRadius: 8, backgroundColor: '#ffeaea' },
  deleteText: { fontSize: 18 },
});