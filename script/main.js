function loadSidebar(activeLinkId) {
    fetch('../component/sidebar.html')
        .then(response => response.text())
        .then(data => {
            // Chèn sidebar vào placeholder
            document.getElementById('sidebar-placeholder').outerHTML = data;

            // Khôi phục trạng thái submenu từ localStorage
            restoreSubmenuStates();

            // Thêm lớp 'active' cho link hiện tại
            if (activeLinkId) {
                const activeLink = document.getElementById(activeLinkId);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
        });
}

function restoreSubmenuStates() {
    // Khôi phục trạng thái submenu từ localStorage
    const submenuStates = JSON.parse(localStorage.getItem('submenuStates')) || {};

    // Thiết lập trạng thái cho các submenu
    for (const [key, value] of Object.entries(submenuStates)) {
        const toggle = document.getElementById(`toggle-${key}`);
        const submenu = document.querySelector(`ul.submenu`);

        if (toggle) {
            toggle.checked = value; // Thiết lập checkbox dựa trên trạng thái đã lưu
            if (value) {
                submenu.classList.add('show'); // Thêm lớp show nếu submenu được mở
            }
        }
    }

    // Xử lý sự kiện cho các nút toggle
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function () {
            const key = this.id.replace('toggle-', ''); // Lấy tên của menu từ ID
            submenuStates[key] = this.checked; // Lưu trạng thái vào localStorage
            localStorage.setItem('submenuStates', JSON.stringify(submenuStates)); // Cập nhật localStorage
        });
    });
}

