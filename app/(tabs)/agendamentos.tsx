import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AgendamentoCard } from '../../components/AgendamentoCard';
import { AgendamentoForm } from '../../components/AgendamentoForm';
import { EmptyState } from '../../components/EmptyState';
import { Agendamento, Paciente, getAllAgendamentos, getAllPacientes, createAgendamento, updateAgendamento, deleteAgendamento } from '../../database/initDatabase';

export default function AgendamentosScreen() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [listKey, setListKey] = useState(0);

  const loadAgendamentos = useCallback(async () => {
    const result = await getAllAgendamentos();
    setAgendamentos(result);
    setListKey(k => k + 1);
  }, []);

  const loadPacientes = useCallback(async () => {
    return await getAllPacientes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAgendamentos();
    }, [loadAgendamentos])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAgendamentos();
    setRefreshing(false);
  };

  const handleSave = async (data: string, tipo: string, id_paciente: number) => {
    if (editingAgendamento) {
      await updateAgendamento(editingAgendamento.id, data, tipo, id_paciente);
    } else {
      await createAgendamento(data, tipo, id_paciente);
    }
    await loadAgendamentos();
  };

  const handleEdit = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setFormVisible(true);
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (idToDelete !== null) {
      try {
        await deleteAgendamento(idToDelete); 
        await loadAgendamentos();
      } catch (e) {
        console.error('Erro ao excluir:', e);
      }
    }
    setDeleteModalVisible(false);
    setIdToDelete(null);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditingAgendamento(null);
  };

  // Substitua a antiga checkDateColor por esta:
  const checkDateColor = (dataString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // Agora a data chega como "12/03/2026", então precisamos separar
    const partes = dataString.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      const ano = parseInt(partes[2], 10);
      
      // mes - 1 porque Janeiro é 0 no JS
      const agendamentoDate = new Date(ano, mes - 1, dia); 
      
      if (agendamentoDate < today) {
        return '#dc2626'; // Passou da data = Vermelho
      } else {
        return '#16a34a'; // No tempo = Verde
      }
    }
    
    return '#1a1a2e'; // Cor padrão caso dê algum erro na leitura
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
      </View>

      <FlatList
        data={agendamentos}
        key={`agendamentos-list-${listKey}`}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AgendamentoCard 
            agendamento={item} 
            statusColor={checkDateColor(item.data)} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
        ListEmptyComponent={<EmptyState message="Nenhum agendamento marcado" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6c3ce0']} />}
        contentContainerStyle={agendamentos.length === 0 ? styles.emptyList : undefined}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AgendamentoForm
        visible={formVisible}
        agendamento={editingAgendamento}
        onClose={handleCloseForm}
        onSave={handleSave}
        onLoadPacientes={loadPacientes}
      />

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Confirmar Exclusão</Text>
            <Text style={styles.deleteMessage}>Tem certeza que deseja excluir este agendamento?</Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity style={styles.cancelDelete} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelDeleteText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDelete} onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ff' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a2e' },
  emptyList: { flex: 1 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6c3ce0', justifyContent: 'center', alignItems: 'center', shadowColor: '#6c3ce0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabText: { fontSize: 32, color: '#fff', fontWeight: '300', marginTop: -2 },
  deleteOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  deleteModal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' },
  deleteTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e', textAlign: 'center', marginBottom: 12 },
  deleteMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  deleteButtons: { flexDirection: 'row', gap: 12 },
  cancelDelete: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  cancelDeleteText: { fontSize: 16, color: '#666', fontWeight: '600' },
  confirmDelete: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#dc2626', alignItems: 'center' },
  confirmDeleteText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});