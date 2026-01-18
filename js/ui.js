export function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-overlay').classList.add('flex');
}

export function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

