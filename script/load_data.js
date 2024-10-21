
window.addEventListener('load', loadSavedDataToContainer);

function loadSavedDataToContainer() {
    const dataContainer = document.getElementById('saved-data-container');

    // Xóa nội dung cũ trong container
    dataContainer.innerHTML = '';

    // Duyệt qua tất cả các mục trong localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Kiểm tra nếu key bắt đầu bằng "file_"
        if (key !== "savedCharts") {
            try {
                const savedData = JSON.parse(localStorage.getItem(key));

                // Kiểm tra xem savedData có hợp lệ không
                if (!savedData || typeof savedData !== 'object') {
                    console.warn(`Dữ liệu không hợp lệ cho key: ${key}`);
                    continue; // Bỏ qua mục này nếu không hợp lệ
                }

                // Tạo tiêu đề cho mục lớn (lấy tên từ key)
                const categoryTitle = document.createElement('h4');
                categoryTitle.textContent = `${key}`;
                //dataContainer.appendChild(categoryTitle);

                // Nếu dữ liệu là một đối tượng với nhiều danh sách
                for (const [category, dataList] of Object.entries(savedData)) {
                    if (!Array.isArray(dataList) || dataList.length === 0) {
                        console.warn(`Dữ liệu không đúng định dạng cho category: ${category}`);
                        continue; // Bỏ qua nếu không phải danh sách hoặc danh sách rỗng
                    }

                    // Tạo tiêu đề cho từng danh mục (category)
                    const subCategoryTitle = document.createElement('h5');
                    subCategoryTitle.textContent = `${category}`;
                    //dataContainer.appendChild(subCategoryTitle);

                    // Tạo danh sách để chứa tên các cột
                    const columnList = document.createElement('ul');
                    columnList.style.listStyleType = 'none'; // Xóa bullet point cho danh sách

                    // Duyệt qua các thuộc tính (tên cột) từ đối tượng đầu tiên trong danh sách
                    for (const columnName of Object.keys(dataList[0])) {
                        const listItem = document.createElement('li');
                        listItem.textContent = columnName;
                        columnList.appendChild(listItem);
                    }

                    // Thêm danh sách vào container
                    // dataContainer.appendChild(columnList);
                }

            } catch (error) {
                console.error(`Lỗi khi phân tích dữ liệu cho key: ${key}`, error);
            }
        }
    }

    // Hiển thị thông báo nếu không có dữ liệu nào trong localStorage
    if (dataContainer.innerHTML === '') {
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'No data saved';
        dataContainer.appendChild(noDataMessage);
    }
}