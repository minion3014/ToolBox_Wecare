document.getElementById('btn-add-slicer').addEventListener('click', function () {
    const dataContainer = document.getElementById('saved-data-container');
    dataContainer.innerHTML = '';  // Xóa nội dung cũ nếu có

    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const selectFileLabel = document.createElement('label');
    selectFileLabel.textContent = 'Chọn File:';
    const selectFile = document.createElement('select');
    selectFile.classList.add('custom-select');

    const selectTableLabel = document.createElement('label');
    selectTableLabel.textContent = 'Chọn bảng:';
    const selectTable = document.createElement('select');
    selectTable.classList.add('custom-select');

    const selectColumnXLabel = document.createElement('label');
    selectColumnXLabel.textContent = 'Chọn đối tượng:';
    const selectColumnX = document.createElement('select');
    selectColumnX.classList.add('custom-select');

    const chartButton = document.createElement('button');
    chartButton.textContent = 'Tạo Biểu Đồ';
    chartButton.classList.add('custom-button');

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== "savedCharts" && key !== "submenuStates") {
            const option = document.createElement('option');
            option.value = key;
            option.text = key;
            selectFile.appendChild(option);
        }
    }

    const selectedFileKey = selectFile.value;
    const selectedFileData = localStorage.getItem(selectedFileKey);

    if (!selectedFileData) {
        console.error('Không tìm thấy dữ liệu cho file: ', selectedFileKey);
        return;
    }

    const selectedFile = JSON.parse(selectedFileData);

    selectTable.innerHTML = '';
    for (const table in selectedFile) {
        if (selectedFile.hasOwnProperty(table)) {
            const option = document.createElement('option');
            option.value = table;
            option.text = table;
            selectTable.appendChild(option);
        }
    }

    selectTable.addEventListener('change', function () {
        const selectedFileKey = selectFile.value;
        const selectedFileData = localStorage.getItem(selectedFileKey);

        if (!selectedFileData) {
            console.error('Không tìm thấy dữ liệu cho file: ', selectedFileKey);
            return;
        }

        const selectedFile = JSON.parse(selectedFileData);
        // Kiểm tra nếu chỉ có một sheet hoặc không có sự thay đổi trong selectTable
        const sheetKey = selectTable.value || selectTable.options[0].value;
        const selectedTable = selectedFile[sheetKey];

        selectColumnX.innerHTML = '';

        if (selectedTable.length > 0) {
            const columns = Object.keys(selectedTable[0]);
            columns.forEach(column => {
                const optionX = document.createElement('option');
                optionX.value = column;
                optionX.text = column;
                selectColumnX.appendChild(optionX);
            });
        }
    });
    // Tự động chọn sheet đầu tiên nếu chỉ có một sheet
    if (selectTable.options.length > 0) {
        selectTable.dispatchEvent(new Event('change'));
    }

    chartButton.addEventListener('click', function () {
        const slicerContainer = createSlicerContainer(); // Tạo slicer container như chart container
        const dataContainer = slicerContainer.querySelector('.slicer-content');

        const selectedFileKey = selectFile.value;
        const selectedFileData = localStorage.getItem(selectedFileKey);

        if (!selectedFileData) {
            console.error('Không tìm thấy dữ liệu cho file: ', selectedFileKey);
            return;
        }

        const selectedFile = JSON.parse(selectedFileData);
        const selectedTable = selectedFile[selectTable.value];
        const columnX = selectColumnX.value;

        const labels = [...new Set(selectedTable.map(row => row[columnX]))]; // Lấy giá trị không trùng lặp

        const dataDropdown = document.createElement('select');
        dataDropdown.classList.add('custom-select');
        // Thêm lựa chọn "All"
        const optionAll = document.createElement('option');
        optionAll.value = 'all';
        optionAll.text = 'All';
        dataDropdown.appendChild(optionAll);
        labels.forEach((label) => {
            const option = document.createElement('option');
            option.value = label;
            option.text = label;
            dataDropdown.appendChild(option);
        });

        dataContainer.appendChild(dataDropdown);
        saveSlicerToLocalStorage(slicerContainer, labels); // Lưu slicer vào localStorage
    });

    formContainer.appendChild(selectFileLabel);
    formContainer.appendChild(selectFile);
    formContainer.appendChild(selectTableLabel);
    formContainer.appendChild(selectTable);
    formContainer.appendChild(selectColumnXLabel);
    formContainer.appendChild(selectColumnX);
    formContainer.appendChild(chartButton);

    dataContainer.appendChild(formContainer);
});
