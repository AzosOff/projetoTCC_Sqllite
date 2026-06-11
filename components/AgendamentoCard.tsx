import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Agendamento } from '../database/initDatabase';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  statusColor: string;
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (id: number) => void;
}

export const AgendamentoCard: React.FC<AgendamentoCardProps> = ({ agendamento, statusColor, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.paciente}>{agendamento.nome_paciente || 'Paciente não encontrado'}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Data:</Text>
          <Text style={[styles.dataValue, { color: statusColor }]}>
            {agendamento.data}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Especialidade:</Text>
          <Text style={styles.tipoValue}>{agendamento.tipo}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(agendamento)}>
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(agendamento.id)}>
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
  paciente: { fontSize: 18, fontWeight: '600', color: '#1a1a2e', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  label: { fontSize: 14, color: '#666', fontWeight: '500' },
  dataValue: { fontSize: 16, fontWeight: '700' },
  tipoValue: { fontSize: 16, color: '#1a1a2e', fontWeight: '600', textTransform: 'capitalize' },
  actions: { flexDirection: 'column', gap: 8 },
  editButton: { padding: 8, borderRadius: 8, backgroundColor: '#f0edff' },
  editText: { fontSize: 18 },
  deleteButton: { padding: 8, borderRadius: 8, backgroundColor: '#ffeaea' },
  deleteText: { fontSize: 18 },
});