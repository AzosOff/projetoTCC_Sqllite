import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PacienteCard } from '../../components/PacienteCard'; 
import { PacienteForm } from '../../components/PacienteForm';
import { EmptyState } from '../../components/EmptyState';
import { Paciente, getAllPacientes, createPaciente, updatePaciente, deletePaciente, searchPacientes } from '../../database/initDatabase';

export default function PacientesScreen() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchText, setSearchText] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const loadPacientes = useCallback(async () => {
    if (searchText.trim()) {
      const result = await searchPacientes(searchText);
      setPacientes(result);
    } else {
      const result = await getAllPacientes();
      setPacientes(result);
    }
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      loadPacientes();
    }, [loadPacientes])
  );

  useEffect(() => {
    loadPacientes();
  }, [searchText, loadPacientes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPacientes();
    setRefreshing(false);
  };

  const handleSave = async (nome: string, email: string, idade: string, numero: string) => {
    if (editingPaciente) {
      await updatePaciente(editingPaciente.id, nome, email, idade, numero);
    } else {
      await createPaciente(nome, email, idade, numero);
    }
    await loadPacientes();
    setEditingPaciente(null);
  };

  const handleEdit = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setFormVisible(true);
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (idToDelete !== null) {
      await deletePaciente(idToDelete);
      await loadPacientes();
    }
    setDeleteModalVisible(false);
    setIdToDelete(null);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditingPaciente(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pacientes</Text>
        <TextInput
          style={styles.search}
          placeholder="Buscar por nome..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PacienteCard paciente={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<EmptyState message="Nenhum paciente cadastrado" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6c3ce0']} />}
        contentContainerStyle={pacientes.length === 0 ? styles.emptyList : undefined}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <PacienteForm
        visible={formVisible}
        paciente={editingPaciente}
        onClose={handleCloseForm}
        onSave={handleSave}
      />

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Confirmar Exclusão</Text>
            <Text style={styles.deleteMessage}>Tem certeza que deseja excluir este paciente? Isso também excluirá todos os seus agendamentos.</Text>
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
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  search: { backgroundColor: '#f0edff', borderRadius: 12, padding: 12, fontSize: 16, color: '#1a1a2e' },
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