let students = JSON.parse(localStorage.getItem('students')) || [];

const studentModal = document.getElementById('student-modal');
const studentForm = document.getElementById('student-form');
const studentList = document.getElementById('student-list');
const toastEl = document.getElementById('toast');

const btnOpenForm = document.getElementById('btn-open-form');
const btnCloseForm = document.getElementById('btn-close-form');

const totalStudentsEl = document.getElementById('total-students');
const averageScoreEl = document.getElementById('average-score');

const formModeInput = document.getElementById('form-mode');
const editingIdInput = document.getElementById('editing-id');
const inputId = document.getElementById('student-id');
const inputName = document.getElementById('student-name');
const inputDob = document.getElementById('student-dob');
const inputClass = document.getElementById('student-class');
const inputGpa = document.getElementById('student-gpa');
const inputEmail = document.getElementById('student-email');

function showInputError(inputElement, errorElementId, message) {
    const errorTarget = document.getElementById(errorElementId);
    if (!errorTarget) return;

    if (message) {
        errorTarget.textContent = message;
        inputElement.classList.add('invalid');
        inputElement.classList.remove('valid');
    } else {
        errorTarget.textContent = '';
        inputElement.classList.remove('invalid');
        inputElement.classList.add('valid');
    }
}

function validateId() {
    const value = inputId.value.trim();
    if (inputId.disabled) return true;

    if (!value) {
        showInputError(inputId, 'error-id', 'Mã sinh viên không được bỏ trống.');
        return false;
    }
    const idRegex = new RegExp("^SV\\d{5}$", "i");
    if (!idRegex.test(value)) {
        showInputError(inputId, 'error-id', 'Mã không hợp lệ (Ví dụ đúng: SV00123).');
        return false;
    }
    const isExist = students.some(s => s.id.toLowerCase() === value.toLowerCase());
    if (isExist) {
        showInputError(inputId, 'error-id', 'Mã sinh viên này đã có trên hệ thống.');
        return false;
    }
    showInputError(inputId, 'error-id', '');
    return true;
}

function validateName() {
    const value = inputName.value.trim();
    if (!value) {
        showInputError(inputName, 'error-name', 'Họ và tên bắt buộc phải nhập.');
        return false;
    }
    if (value.length < 2 || value.length > 50) {
        showInputError(inputName, 'error-name', 'Họ tên phải nằm trong khoảng từ 2 đến 50 ký tự.');
        return false;
    }
    showInputError(inputName, 'error-name', '');
    return true;
}

function validateDob() {
    const value = inputDob.value;
    if (!value) {
        showInputError(inputDob, 'error-dob', 'Vui lòng xác định ngày sinh.');
        return false;
    }
    const dob = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (age < 15 || age > 60) {
        showInputError(inputDob, 'error-dob', 'Tuổi sinh viên không hợp lệ (Từ 15 đến 60 tuổi).');
        return false;
    }
    showInputError(inputDob, 'error-dob', '');
    return true;
}

function validateClass() {
    const value = inputClass.value.trim();
    if (!value) {
        showInputError(inputClass, 'error-class', 'Lớp học không được để trống.');
        return false;
    }
    showInputError(inputClass, 'error-class', '');
    return true;
}

function validateGpa() {
    const value = inputGpa.value.trim();
    if (!value) {
        showInputError(inputGpa, 'error-gpa', 'Điểm trung bình không được để trống.');
        return false;
    }
    const gpa = parseFloat(value);
    if (isNaN(gpa) || gpa < 0 || gpa > 10) {
        showInputError(inputGpa, 'error-gpa', 'Điểm phải là số hợp lệ từ 0.0 đến 10.0.');
        return false;
    }
    showInputError(inputGpa, 'error-gpa', '');
    return true;
}

function validateEmail() {
    const value = inputEmail.value.trim();
    if (!value) {
        showInputError(inputEmail, 'error-email', 'Địa chỉ email không được bỏ trống.');
        return false;
    }
    const emailRegex = new RegExp("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    if (!emailRegex.test(value)) {
        showInputError(inputEmail, 'error-email', 'Định dạng Email không chính xác.');
        return false;
    }
    showInputError(inputEmail, 'error-email', '');
    return true;
}

function setupRealtimeValidation() {
    const inputsMap = [
        { el: inputId, check: validateId },
        { el: inputName, check: validateName },
        { el: inputDob, check: validateDob },
        { el: inputClass, check: validateClass },
        { el: inputGpa, check: validateGpa },
        { el: inputEmail, check: validateEmail }
    ];

    inputsMap.forEach(({ el, check }) => {
        el.addEventListener('input', check);
        el.addEventListener('blur', check);
    });
}

function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

function updateStatistics() {
    totalStudentsEl.textContent = students.length;
    if (students.length === 0) {
        averageScoreEl.textContent = '0.0';
        return;
    }
    const totalScore = students.reduce((sum, s) => sum + parseFloat(s.gpa || 0), 0);
    averageScoreEl.textContent = (totalScore / students.length).toFixed(2);
}

function showMessage(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    setTimeout(() => toastEl.classList.add('hidden'), 3000);
}

function resetForm() {
    studentForm.reset();
    formModeInput.value = 'create';
    editingIdInput.value = '';
    document.getElementById('modal-title').textContent = 'Thêm Sinh Viên Mới';
    inputId.disabled = false;

    const inputs = [inputId, inputName, inputDob, inputClass, inputGpa, inputEmail];
    inputs.forEach(input => input.classList.remove('invalid', 'valid'));

    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
}

function renderStudents() {
    studentList.innerHTML = '';
    if (students.length === 0) {
        studentList.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888;">Chưa có dữ liệu sinh viên trong hệ thống</td></tr>`;
        return;
    }

    students.forEach((student) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.dob}</td>
            <td>${student.class}</td>
            <td>${student.gpa}</td>
            <td>${student.email}</td>
            <td>
                <button class="btn btn-primary btn-sm btn-edit" data-id="${student.id}">Sửa</button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${student.id}">Xóa</button>
            </td>
        `;
        studentList.appendChild(tr);
    });
}

btnOpenForm.addEventListener('click', () => {
    resetForm();
    studentModal.classList.remove('hidden');
});

btnCloseForm.addEventListener('click', () => {
    studentModal.classList.add('hidden');
});

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const isIdValid = validateId();
    const isNameValid = validateName();
    const isDobValid = validateDob();
    const isClassValid = validateClass();
    const isGpaValid = validateGpa();
    const isEmailValid = validateEmail();

    if (!isIdValid || !isNameValid || !isDobValid || !isClassValid || !isGpaValid || !isEmailValid) {
        showMessage('Vui lòng hoàn thiện đúng thông tin trên Form.');
        return;
    }

    const studentData = {
        id: inputId.value.trim(),
        name: inputName.value.trim(),
        dob: inputDob.value,
        class: inputClass.value.trim(),
        gpa: parseFloat(inputGpa.value),
        email: inputEmail.value.trim()
    };

    const mode = formModeInput.value;

    if (mode === 'create') {
        students.push(studentData);
        showMessage('Thêm mới sinh viên thành công!');
    } else if (mode === 'edit') {
        const targetId = editingIdInput.value;
        const index = students.findIndex(s => s.id === targetId);
        if (index !== -1) {
            students[index] = studentData;
            showMessage('Cập nhật hồ sơ thành công!');
        }
    }

    saveStudents();
    renderStudents();
    updateStatistics();
    studentModal.classList.add('hidden');
});

studentList.addEventListener('click', (e) => {
    const target = e.target;
    const studentId = target.getAttribute('data-id');
    if (!studentId) return;

    if (target.classList.contains('btn-delete')) {
        if (confirm(`Bạn có thực sự muốn xóa sinh viên ${studentId}?`)) {
            students = students.filter(s => s.id !== studentId);
            saveStudents();
            renderStudents();
            updateStatistics();
            showMessage('Đã xóa sinh viên.');
        }
    }

    if (target.classList.contains('btn-edit')) {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        resetForm();

        inputId.value = student.id;
        inputId.disabled = true;
        inputName.value = student.name;
        inputDob.value = student.dob;
        inputClass.value = student.class;
        inputGpa.value = student.gpa;
        inputEmail.value = student.email;

        formModeInput.value = 'edit';
        editingIdInput.value = student.id;
        document.getElementById('modal-title').textContent = 'Cập Nhật Thông Tin Sinh Viên';

        studentModal.classList.remove('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderStudents();
    updateStatistics();
    setupRealtimeValidation();
}
)