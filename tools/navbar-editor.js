class NavbarEditor {
    constructor() {
        this.navbarConfig = {
            navbarItems: [],
            zhEnPaths: []
        };
        this.currentEditingItem = null;
        this.currentEditingPath = null;
        this.previewLanguage = 'en';
        this.currentConfigPath = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConfigFromFile();
    }

    setupEventListeners() {
        document.getElementById('loadConfig').addEventListener('click', () => this.loadConfigFile());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileLoad(e));
        document.getElementById('addItem').addEventListener('click', () => this.addNewItem());
        document.getElementById('addPathMapping').addEventListener('click', () => this.addPathMapping());
        document.getElementById('saveToJson').addEventListener('click', () => this.saveToJson());

        // Preview buttons
        document.getElementById('previewEn').addEventListener('click', () => this.setPreviewLanguage('en'));
        document.getElementById('previewZh').addEventListener('click', () => this.setPreviewLanguage('zh'));

        // Modal events
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeModal());
        document.getElementById('deleteItem').addEventListener('click', () => this.deleteCurrentItem());
        document.getElementById('itemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCurrentItem();
        });

        // Close modal when clicking outside
        document.getElementById('itemModal').addEventListener('click', (e) => {
            if (e.target.id === 'itemModal') {
                this.closeModal();
            }
        });
    }

    showMessage(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.className = `px-3 py-2 rounded text-sm h-12 flex items-center min-w-0 opacity-100 ${type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : 
                                                   type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                                                   'bg-blue-100 text-blue-800 border border-blue-300'}`;
        statusEl.textContent = message;
        
        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
    }

    hideMessage() {
        const statusEl = document.getElementById('statusMessage');
        statusEl.className = 'opacity-0 px-3 py-2 rounded text-sm h-12 flex items-center min-w-0';
        statusEl.textContent = '';
    }

    async loadConfigFromFile() {
        this.hideMessage();
        
        // Load from JSON file via Electron
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.loadJsonFile();
                if (result.success) {
                    this.navbarConfig = result.data;
                    this.showMessage('✅ Loaded configuration from navbar-config.json', 'success');
                    this.updateConfigPathDisplay(); // Default path
                    
                    this.renderNavItems();
                    this.renderPathMappings();
                    this.updateNavbarPreview();
                    this.updateJsonPreview();
                } else {
                    this.showMessage(`❌ Failed to load configuration: ${result.error}`, 'error');
                }
            } catch (error) {
                this.showMessage(`❌ Error loading JSON file: ${error.message}`, 'error');
            }
        } else {
            this.showMessage('❌ Electron API not available', 'error');
        }
    }

    async loadConfigFile() {
        // Use Electron's file dialog
        if (window.electronAPI) {
            try {
                const dialogResult = await window.electronAPI.showOpenDialog();
                if (dialogResult.canceled) return;
                
                const filePath = dialogResult.filePaths[0];
                const result = await window.electronAPI.loadJsonFile(filePath);
                
                if (result.success) {
                    this.navbarConfig = result.data;
                    this.showMessage('✅ Successfully loaded config from file', 'success');
                    this.updateConfigPathDisplay(filePath);
                    
                    this.renderNavItems();
                    this.renderPathMappings();
                    this.updateNavbarPreview();
                    this.updateJsonPreview();
                } else {
                    this.showMessage(`❌ Failed to load file: ${result.error}`, 'error');
                }
                
            } catch (error) {
                this.showMessage(`❌ Failed to load file: ${error.message}`, 'error');
            }
        } else {
            // Fallback for browser environment
            if ('showOpenFilePicker' in window) {
                try {
                    const [fileHandle] = await window.showOpenFilePicker({
                        types: [{
                            description: 'JSON files',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });
                    
                    const file = await fileHandle.getFile();
                    const contents = await file.text();
                    const config = JSON.parse(contents);
                    
                    this.navbarConfig = config;
                    this.showMessage('✅ Successfully loaded config from file', 'success');
                    
                    this.renderNavItems();
                    this.renderPathMappings();
                    this.updateNavbarPreview();
                    this.updateJsonPreview();
                    
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        this.showMessage(`❌ Failed to load file: ${error.message}`, 'error');
                    }
                }
            } else {
                // Fallback to file input
                document.getElementById('fileInput').click();
            }
        }
    }


    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                this.navbarConfig = config;
                this.showMessage('✅ Successfully loaded config from file', 'success');
                this.updateConfigPathDisplay(file.name);
                
                this.renderNavItems();
                this.renderPathMappings();
                this.updateNavbarPreview();
                this.updateJsonPreview();
                
            } catch (error) {
                this.showMessage(`❌ Failed to parse JSON: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset the input
        event.target.value = '';
    }

    getRealConfig() {
        // Real configuration data from navbar-config.json
        return {
            "navbarItems": [
                {
                    "en": "About Us",
                    "zh": "關於我們",
                    "items": [
                        {
                            "en": "Our Story",
                            "zh": "我們的故事",
                            "enLink": "/en/about-us/our-story",
                            "zhLink": "/about-us/our-story"
                        },
                        {
                            "en": "Careers",
                            "zh": "徵人啟事",
                            "enLink": "/about-us/careers"
                        },
                        {
                            "en": "Resources",
                            "zh": "教會資源",
                            "enLink": "/en/about-us/resources",
                            "zhLink": "/about-us/resources"
                        }
                    ]
                },
                {
                    "en": "Worship Services",
                    "zh": "聚會與敬拜",
                    "items": [
                        {
                            "en": "Worship Gathering",
                            "zh": "時間與地點",
                            "enLink": "/en/gatherings/service-information",
                            "zhLink": "/worship/locations"
                        },
                        {
                            "en": "Sermon Recordings",
                            "zh": "主日信息",
                            "enLink": "/en/gatherings/sermons",
                            "zhLink": "/sermons"
                        },
                        {
                            "en": "2025 All Church Retreat",
                            "zh": "2025 全教會退修會",
                            "enLink": "https://retreat.ecanaan.org/"
                        }
                    ]
                },
                {
                    "en": "Ministries",
                    "zh": "教會事工",
                    "items": [
                        {
                            "en": "Taiwanese Ministry",
                            "zh": "台語事工",
                            "enLink": "/ministries/taiwanese-ministry",
                            "enOrder": 1
                        },
                        {
                            "en": "Mandarin Ministry",
                            "zh": "華語事工",
                            "enLink": "/ministries/mandarin-ministry",
                            "enOrder": 2
                        },
                        {
                            "en": "English Ministry",
                            "zh": "英語事工",
                            "enLink": "/ministries/english-ministry",
                            "enOrder": 0,
                            "items": [
                                {
                                    "en": "Home",
                                    "zh": "主頁",
                                    "enLink": "/ministries/english-ministry"
                                },
                                {
                                    "en": "Announcements",
                                    "zh": "最新公告",
                                    "enLink": "/ministries/english-ministry/announcements"
                                }
                            ]
                        },
                        {
                            "en": "Youth Ministry",
                            "zh": "青少事工",
                            "enLink": "/ministries/youth-ministry"
                        },
                        {
                            "en": "Children's Ministry",
                            "zh": "兒童事工",
                            "items": [
                                {
                                    "en": "Home",
                                    "zh": "主頁",
                                    "enLink": "/ministries/childrens-ministry"
                                },
                                {
                                    "en": "Sunday Programs",
                                    "zh": "主日崇拜",
                                    "enLink": "/ministries/childrens-ministry/sunday-programs"
                                },
                                {
                                    "en": "Announcements",
                                    "zh": "最新公告",
                                    "enLink": "/ministries/childrens-ministry/announcements"
                                },
                                {
                                    "en": "2025 VBS Summer Camp",
                                    "zh": "2025 VBS 聖經夏令營",
                                    "enLink": "/events/2025-vps-summer-camp"
                                }
                            ]
                        },
                        {
                            "en": "Family Ministry",
                            "zh": "家庭事工",
                            "enLink": "/en/ministries/family-ministry",
                            "zhLink": "/ministries/family-ministry"
                        },
                        {
                            "en": "Missions",
                            "zh": "宣教事工",
                            "items": [
                                {
                                    "en": "Mission Support",
                                    "zh": "宣教支持",
                                    "enLink": "/missions/mission-support"
                                },
                                {
                                    "en": "2025 STM Directory",
                                    "zh": "2025 短宣名錄",
                                    "enLink": "/missions/2025-stm-directory"
                                },
                                {
                                    "en": "2025 STM Support Letters",
                                    "zh": "2025 短宣代禱",
                                    "enLink": "/missions/2025-stm-support-letters"
                                },
                                {
                                    "en": "2025 STM Updates",
                                    "zh": "2025 STM 最新消息",
                                    "enLink": "/missions/2025-stm-updates"
                                }
                            ]
                        }
                    ]
                },
                {
                    "en": "Growth",
                    "zh": "靈命成長",
                    "items": [
                        {
                            "en": "Sunday School",
                            "zh": "主日學",
                            "enLink": "/en/growth/sunday-school",
                            "zhLink": "/growth/sunday-school"
                        },
                        {
                            "en": "Basic Christianity",
                            "zh": "基要真理",
                            "enLink": "/growth/basic-christianity"
                        },
                        {
                            "en": "Discipleship",
                            "zh": "門徒訓練",
                            "enLink": "/growth/discipleship"
                        },
                        {
                            "en": "Blog",
                            "zh": "文章分享",
                            "enLink": "/growth/blog"
                        },
                        {
                            "en": "Testimony (Video)",
                            "zh": "見證分享 (影音)",
                            "enLink": "/growth/videos"
                        },
                        {
                            "en": "Special Events",
                            "zh": "特別聚會",
                            "enLink": "/growth/special-events"
                        }
                    ]
                },
                {
                    "en": "Fellowships",
                    "zh": "團契生活",
                    "items": [
                        {
                            "en": "English Fellowships",
                            "zh": "英語團契",
                            "enLink": "/en/fellowships/en",
                            "enOrder": 0
                        },
                        {
                            "en": "Taiwanese Fellowships",
                            "zh": "台語團契",
                            "enLink": "/en/fellowships/tm",
                            "zhLink": "/fellowships/tm",
                            "enOrder": 1
                        },
                        {
                            "en": "Mandarin Fellowships",
                            "zh": "華語團契",
                            "zhLink": "/fellowships/mm",
                            "enOrder": 2
                        },
                        {
                            "en": "Event Highlights",
                            "zh": "活動花絮",
                            "enLink": "/photos"
                        }
                    ]
                },
                {
                    "en": "中文",
                    "zh": "English",
                    "language": true
                }
            ],
            "zhEnPaths": [
                ["/zh", "/en"],
                ["/fellowships/tm/cupertino", "/en/fellowships/tm/cupertino"],
                ["/fellowships/tm/fremont", "/en/fellowships/tm/fremont"],
                ["/fellowships/tm/mid-peninsula", "/en/fellowships/tm/mid-peninsula"],
                ["/fellowships/tm/milpitas", "/en/fellowships/tm/milpitas"],
                ["/fellowships/tm/palo-alto", "/en/fellowships/tm/palo-alto"],
                ["/fellowships/tm/saratoga", "/en/fellowships/tm/saratoga"],
                ["/fellowships/tm/living-springs", "/en/fellowships/tm/living-springs"],
                ["/fellowships/tm/living-stones", "/en/fellowships/tm/living-stones"],
                ["/fellowships/tm/tyfm", "/en/fellowships/tm/tyfm"]
            ]
        };
    }

    getSampleConfig() {
        // Fallback sample config for testing
        return {
            navbarItems: [
                {
                    en: 'About Us',
                    zh: '關於我們',
                    items: [
                        {
                            en: 'Our Story',
                            zh: '我們的故事',
                            enLink: '/en/about-us/our-story',
                            zhLink: '/about-us/our-story'
                        }
                    ]
                }
            ],
            zhEnPaths: [
                ['/zh', '/en']
            ]
        };
    }

    renderNavItems() {
        const container = document.getElementById('navItems');
        container.innerHTML = '';

        this.navbarConfig.navbarItems.forEach((item, index) => {
            const itemElement = this.createNavItemElement(item, index);
            container.appendChild(itemElement);
        });
    }

    createNavItemElement(item, index, level = 0, parentIndex = null) {
        const div = document.createElement('div');
        div.className = `nav-item bg-gray-50 border rounded p-3 transition-all duration-200 ${level > 0 ? 'nested-item' + (level > 1 ? '-2' : '') : ''}`;
        div.dataset.index = index;
        div.dataset.level = level;
        if (parentIndex !== null) {
            div.dataset.parentIndex = parentIndex;
        }

        const content = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <div class="text-sm">
                        <span class="font-medium">${item.en || 'No English text'}</span>
                        <span class="text-gray-600 ml-2">${item.zh || 'No Chinese text'}</span>
                        ${item.language ? '<span class="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs ml-2">Lang</span>' : ''}
                        ${item.enOrder !== undefined ? `<span class="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-xs ml-2">EN:${item.enOrder}</span>` : ''}
                    </div>
                </div>
                <div class="flex space-x-1">
                    <button class="move-up bg-gray-400 text-white px-1.5 py-1 rounded text-xs hover:bg-gray-500" title="Move Up">
                        ↑
                    </button>
                    <button class="move-down bg-gray-400 text-white px-1.5 py-1 rounded text-xs hover:bg-gray-500" title="Move Down">
                        ↓
                    </button>
                    <button class="edit-item bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">
                        Edit
                    </button>
                    ${level < 2 ? '<button class="add-child bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">Add Child</button>' : ''}
                </div>
            </div>
        `;

        div.innerHTML = content;

        // Add event listeners
        div.querySelector('.edit-item').addEventListener('click', () => this.editItem(item, index, level, parentIndex));
        div.querySelector('.move-up').addEventListener('click', () => this.moveItemUp(index, level, parentIndex));
        div.querySelector('.move-down').addEventListener('click', () => this.moveItemDown(index, level, parentIndex));
        const addChildBtn = div.querySelector('.add-child');
        if (addChildBtn) {
            addChildBtn.addEventListener('click', () => this.addChildItem(item, index));
        }

        // Render child items
        if (item.items && item.items.length > 0) {
            const childContainer = document.createElement('div');
            childContainer.className = 'mt-2 space-y-2';
            item.items.forEach((childItem, childIndex) => {
                const childElement = this.createNavItemElement(childItem, childIndex, level + 1, index);
                childContainer.appendChild(childElement);
            });
            div.appendChild(childContainer);
        }

        return div;
    }

    getAllAvailablePaths() {
        const paths = { zh: new Set(), en: new Set() };

        const extractPathsFromItems = (items) => {
            items.forEach(item => {
                if (item.zhLink && !item.zhLink.startsWith('http')) {
                    paths.zh.add(item.zhLink);
                }
                if (item.enLink && !item.enLink.startsWith('http')) {
                    paths.en.add(item.enLink);
                }
                if (item.items) {
                    extractPathsFromItems(item.items);
                }
            });
        };

        extractPathsFromItems(this.navbarConfig.navbarItems);

        // Add common paths
        paths.zh.add('/zh');
        paths.zh.add('/');
        paths.en.add('/en');

        // Add paths from existing mappings
        this.navbarConfig.zhEnPaths.forEach(([zhPath, enPath]) => {
            if (zhPath && !zhPath.startsWith('http')) paths.zh.add(zhPath);
            if (enPath && !enPath.startsWith('http')) paths.en.add(enPath);
        });

        return {
            zh: Array.from(paths.zh).sort(),
            en: Array.from(paths.en).sort()
        };
    }

    renderPathMappings() {
        const container = document.getElementById('pathMappings');
        container.innerHTML = '';

        // Get all available paths from navbar items
        const availablePaths = this.getAllAvailablePaths();

        this.navbarConfig.zhEnPaths.forEach((mapping, index) => {
            const div = document.createElement('div');
            div.className = 'bg-gray-50 border rounded p-3';

            div.innerHTML = `
                <div class="flex items-center space-x-4 mb-2">
                    <div class="flex-1">
                        <div class="relative">
                            <input type="text" value="${mapping[0]}" class="w-full border rounded px-2 py-1 pr-8" data-type="zh" data-index="${index}" placeholder="Chinese path">
                            <button class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" data-dropdown="zh-${index}">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <div class="dropdown-menu hidden absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto" id="dropdown-zh-${index}">
                                ${availablePaths.zh.map(path => `
                                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" data-path="${path}" data-target-input="zh" data-target-index="${index}">
                                        ${path}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <span>→</span>
                    <div class="flex-1">
                        <div class="relative">
                            <input type="text" value="${mapping[1]}" class="w-full border rounded px-2 py-1 pr-8" data-type="en" data-index="${index}" placeholder="English path">
                            <button class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" data-dropdown="en-${index}">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <div class="dropdown-menu hidden absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto" id="dropdown-en-${index}">
                                ${availablePaths.en.map(path => `
                                    <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" data-path="${path}" data-target-input="en" data-target-index="${index}">
                                        ${path}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <button class="delete-mapping bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600" data-index="${index}">
                        Delete
                    </button>
                </div>
            `;

            // Add event listeners for path mapping inputs
            div.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', this.updatePathMapping.bind(this));
                input.addEventListener('input', this.filterDropdownPaths.bind(this));
                input.addEventListener('focus', this.showFilteredDropdown.bind(this));
                input.addEventListener('keydown', this.handleDropdownKeyboard.bind(this));
            });

            // Add dropdown toggle listeners
            div.querySelectorAll('[data-dropdown]').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const dropdownId = button.dataset.dropdown;
                    const dropdown = document.getElementById(`dropdown-${dropdownId}`);

                    // Close all other dropdowns
                    document.querySelectorAll('.dropdown-menu').forEach(d => {
                        if (d.id !== `dropdown-${dropdownId}`) {
                            d.classList.add('hidden');
                        }
                    });

                    dropdown.classList.toggle('hidden');
                });
            });

            // Add dropdown option listeners
            div.querySelectorAll('[data-path]').forEach(option => {
                option.addEventListener('click', () => {
                    const path = option.dataset.path;
                    const targetInput = option.dataset.targetInput;
                    const targetIndex = parseInt(option.dataset.targetIndex);

                    // Update the input value
                    const input = div.querySelector(`input[data-type="${targetInput}"][data-index="${targetIndex}"]`);
                    input.value = path;

                    // Update the configuration
                    if (targetInput === 'zh') {
                        this.navbarConfig.zhEnPaths[targetIndex][0] = path;
                    } else {
                        this.navbarConfig.zhEnPaths[targetIndex][1] = path;
                    }

                    // Hide the dropdown
                    option.closest('.dropdown-menu').classList.add('hidden');

                    this.updateNavbarPreview();
                    this.updateJsonPreview();
                    this.autoSaveConfig();
                });
            });

            div.querySelector('.delete-mapping').addEventListener('click', () => {
                this.navbarConfig.zhEnPaths.splice(index, 1);
                this.renderPathMappings();
                this.updateNavbarPreview();
                this.updateJsonPreview();
                this.autoSaveConfig();
            });

            container.appendChild(div);
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.relative')) {
                document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                    dropdown.classList.add('hidden');
                });
            }
        });
    }

    updatePathMapping(event) {
        const input = event.target;
        const index = parseInt(input.dataset.index);
        const type = input.dataset.type;
        const value = input.value;

        if (type === 'zh') {
            this.navbarConfig.zhEnPaths[index][0] = value;
        } else {
            this.navbarConfig.zhEnPaths[index][1] = value;
        }

        this.updateNavbarPreview();
        this.updateJsonPreview();
        this.autoSaveConfig();
    }

    addPathMapping() {
        this.navbarConfig.zhEnPaths.push(['', '']);
        this.renderPathMappings();
        this.updateNavbarPreview();
        this.updateJsonPreview();
        this.autoSaveConfig();
    }

    editItem(item, index, level, parentIndex = null) {
        this.currentEditingItem = { item, index, level, parentIndex };
        this.openModal(item);
    }

    openModal(item) {
        document.getElementById('itemEn').value = item.en || '';
        document.getElementById('itemZh').value = item.zh || '';
        document.getElementById('itemEnLink').value = item.enLink || '';
        document.getElementById('itemZhLink').value = item.zhLink || '';
        document.getElementById('itemEnOrder').value = item.enOrder || '';
        document.getElementById('itemLanguage').checked = item.language || false;

        document.getElementById('itemModal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('itemModal').classList.add('hidden');
        this.currentEditingItem = null;
    }

    saveCurrentItem() {
        if (!this.currentEditingItem) return;

        const item = this.currentEditingItem.item;

        item.en = document.getElementById('itemEn').value;
        item.zh = document.getElementById('itemZh').value;
        item.enLink = document.getElementById('itemEnLink').value || undefined;
        item.zhLink = document.getElementById('itemZhLink').value || undefined;
        const enOrder = document.getElementById('itemEnOrder').value;
        item.enOrder = enOrder ? parseInt(enOrder) : undefined;
        item.language = document.getElementById('itemLanguage').checked || undefined;

        this.renderNavItems();
        this.updateNavbarPreview();
        this.updateJsonPreview();
        this.autoSaveConfig();
        this.closeModal();
    }

    deleteCurrentItem() {
        if (!this.currentEditingItem) return;

        const { index, level, parentIndex } = this.currentEditingItem;

        if (level === 0) {
            // Delete top-level item
            this.navbarConfig.navbarItems.splice(index, 1);
        } else if (level === 1 && parentIndex !== null) {
            // Delete first-level nested item
            const parentItem = this.navbarConfig.navbarItems[parentIndex];
            if (parentItem && parentItem.items) {
                parentItem.items.splice(index, 1);
                // Remove items array if empty
                if (parentItem.items.length === 0) {
                    delete parentItem.items;
                }
            }
        } else if (level === 2 && parentIndex !== null) {
            // Delete second-level nested item
            // Need to find the parent of the parent for level 2 items
            // This requires more complex tracking, but for now we'll handle basic cases
            const parentPath = this.findParentPath(this.currentEditingItem.item);
            if (parentPath) {
                parentPath.items.splice(index, 1);
                if (parentPath.items.length === 0) {
                    delete parentPath.items;
                }
            }
        }

        this.renderNavItems();
        this.updateNavbarPreview();
        this.updateJsonPreview();
        this.autoSaveConfig();
        this.closeModal();
    }

    findParentPath(targetItem) {
        // Helper function to find the parent of a deeply nested item
        const findInItems = (items) => {
            for (const item of items) {
                if (item.items) {
                    for (const subItem of item.items) {
                        if (subItem === targetItem) {
                            return item;
                        }
                        if (subItem.items) {
                            const found = findInItems([subItem]);
                            if (found) return found;
                        }
                    }
                }
            }
            return null;
        };
        
        return findInItems(this.navbarConfig.navbarItems);
    }

    addNewItem() {
        const newItem = {
            en: 'New Item',
            zh: '新項目',
            items: []
        };

        this.navbarConfig.navbarItems.push(newItem);
        this.renderNavItems();
        this.updateNavbarPreview();
        this.updateJsonPreview();
        this.autoSaveConfig();
    }

    addChildItem(parentItem, parentIndex) {
        if (!parentItem.items) {
            parentItem.items = [];
        }

        const newChild = {
            en: 'New Child',
            zh: '新子項目'
        };

        parentItem.items.push(newChild);
        this.renderNavItems();
        this.updateNavbarPreview();
        this.updateJsonPreview();
        this.autoSaveConfig();
    }

    // Move Up/Down functionality
    moveItemUp(itemIndex, level, parentIndex = null) {
        if (level === 0) {
            // Top-level item
            if (itemIndex > 0) {
                const [movedItem] = this.navbarConfig.navbarItems.splice(itemIndex, 1);
                this.navbarConfig.navbarItems.splice(itemIndex - 1, 0, movedItem);
                
                this.renderNavItems();
                        this.updateNavbarPreview();
                this.highlightMovedItem(itemIndex - 1, 0);
                this.autoSaveConfig();
            }
        } else if (level === 1 && parentIndex !== null) {
            // Sub-item
            const parentItem = this.navbarConfig.navbarItems[parentIndex];
            if (parentItem && parentItem.items && itemIndex > 0) {
                const [movedItem] = parentItem.items.splice(itemIndex, 1);
                parentItem.items.splice(itemIndex - 1, 0, movedItem);
                
                this.renderNavItems();
                        this.updateNavbarPreview();
                this.highlightMovedItem(itemIndex - 1, 1, parentIndex);
                this.autoSaveConfig();
            }
        }
    }

    moveItemDown(itemIndex, level, parentIndex = null) {
        if (level === 0) {
            // Top-level item
            if (itemIndex < this.navbarConfig.navbarItems.length - 1) {
                const [movedItem] = this.navbarConfig.navbarItems.splice(itemIndex, 1);
                this.navbarConfig.navbarItems.splice(itemIndex + 1, 0, movedItem);
                
                this.renderNavItems();
                        this.updateNavbarPreview();
                this.highlightMovedItem(itemIndex + 1, 0);
                this.autoSaveConfig();
            }
        } else if (level === 1 && parentIndex !== null) {
            // Sub-item
            const parentItem = this.navbarConfig.navbarItems[parentIndex];
            if (parentItem && parentItem.items && itemIndex < parentItem.items.length - 1) {
                const [movedItem] = parentItem.items.splice(itemIndex, 1);
                parentItem.items.splice(itemIndex + 1, 0, movedItem);
                
                this.renderNavItems();
                        this.updateNavbarPreview();
                this.highlightMovedItem(itemIndex + 1, 1, parentIndex);
                this.autoSaveConfig();
            }
        }
    }

    async autoSaveConfig() {
        if (window.electronAPI) {
            try {
                const config = {
                    navbarItems: this.navbarConfig.navbarItems,
                    zhEnPaths: this.navbarConfig.zhEnPaths
                };
                
                // Use the currently loaded file path, or default if none
                const saveToPath = this.currentConfigPath && this.currentConfigPath !== 'navbar-config.json (default)' 
                    ? this.currentConfigPath 
                    : null;
                
                const result = await window.electronAPI.saveJsonFile(saveToPath, config);
                if (result.success) {
                    this.showMessage('✅ Auto-saved', 'success');
                } else {
                    this.showMessage(`❌ Auto-save failed: ${result.error}`, 'error');
                }
            } catch (error) {
                this.showMessage(`❌ Auto-save error: ${error.message}`, 'error');
            }
        } else {
            this.showMessage('❌ Auto-save not available', 'error');
        }
    }

    highlightMovedItem(itemIndex, level, parentIndex = null) {
        // Wait for the DOM to update after re-rendering
        setTimeout(() => {
            const items = document.querySelectorAll('.bg-gray-50');
            let targetItem = null;
            
            // Find the moved item in the DOM
            items.forEach(item => {
                const index = parseInt(item.dataset.index);
                const itemLevel = parseInt(item.dataset.level);
                const itemParentIndex = item.dataset.parentIndex ? parseInt(item.dataset.parentIndex) : null;
                
                if (index === itemIndex && itemLevel === level && itemParentIndex === parentIndex) {
                    targetItem = item;
                }
            });
            
            if (targetItem) {
                // Add highlight animation
                targetItem.classList.add('bg-green-100', 'border-green-300', 'transition-all', 'duration-300');
                
                // Remove highlight after 2 seconds
                setTimeout(() => {
                    targetItem.classList.remove('bg-green-100', 'border-green-300');
                    setTimeout(() => {
                        targetItem.classList.remove('transition-all', 'duration-300');
                    }, 300);
                }, 2000);
            }
        }, 100);
    }

    updateJsonPreview() {
        const config = {
            navbarItems: this.navbarConfig.navbarItems,
            zhEnPaths: this.navbarConfig.zhEnPaths
        };
        document.getElementById('jsonPreview').value = JSON.stringify(config, null, 2);
    }

    updateConfigPathDisplay(filePath = null) {
        const pathElement = document.getElementById('configPath');
        if (filePath) {
            this.currentConfigPath = filePath;
            pathElement.textContent = `📁 Config: ${filePath}`;
            pathElement.className = 'text-sm text-blue-600 italic';
        } else {
            // Default path
            this.currentConfigPath = 'navbar-config.json (default)';
            pathElement.textContent = `📁 Config: navbar-config.json (default)`;
            pathElement.className = 'text-sm text-gray-600 italic';
        }
    }

    async saveToJson() {
        const config = {
            navbarItems: this.navbarConfig.navbarItems,
            zhEnPaths: this.navbarConfig.zhEnPaths
        };
        
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.saveJsonFile(null, config);
                if (result.success) {
                    this.showMessage('✅ Configuration saved to navbar-config.json', 'success');
                } else {
                    this.showMessage(`❌ Failed to save: ${result.error}`, 'error');
                }
            } catch (error) {
                this.showMessage(`❌ Save error: ${error.message}`, 'error');
            }
        } else {
            this.showMessage('❌ Save functionality requires Electron', 'error');
        }
    }

    setPreviewLanguage(language) {
        this.previewLanguage = language;
        this.updateNavbarPreview();

        // Update button states
        document.getElementById('previewEn').classList.toggle('bg-blue-700', language === 'en');
        document.getElementById('previewEn').classList.toggle('bg-blue-500', language !== 'en');
        document.getElementById('previewZh').classList.toggle('bg-blue-700', language === 'zh');
        document.getElementById('previewZh').classList.toggle('bg-blue-500', language !== 'zh');
    }

    updateNavbarPreview() {
        const container = document.getElementById('navbarPreview');
        const isEn = this.previewLanguage === 'en';

        const logoUrl = isEn
            ? 'https://cdn.jsdelivr.net/gh/ecanaantaiwanesechurch/web@main/web/static/logo_en.png'
            : 'https://cdn.jsdelivr.net/gh/ecanaantaiwanesechurch/web@main/web/static/logo_zh.png';

        const homeUrl = isEn ? '/en' : '/zh';
        const navItems = this.navbarConfig.navbarItems.map(item => this.createPreviewNavItem(item, isEn)).join('');

        container.innerHTML = `
            <nav class="bg-white shadow-sm relative pb-80">
                <div class="max-w-full mx-auto px-4">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo -->
                        <div class="flex-shrink-0">
                            <a href="${homeUrl}" class="flex items-center">
                                <img src="${logoUrl}" alt="Logo" class="h-8 w-auto">
                            </a>
                        </div>

                        <!-- Navigation -->
                        <div class="hidden md:block">
                            <ul class="flex items-center space-x-16">
                                ${navItems}
                            </ul>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button class="p-2 text-gray-700">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    createPreviewNavItem(item, isEn) {
        const text = isEn ? item.en : item.zh;

        if (item.language) {
            return `
                <li class="relative">
                    <a href="#" class="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm whitespace-nowrap">
                        ${text}
                    </a>
                </li>
            `;
        }

        if (item.items && item.items.length > 0) {
            let sortedItems = [...item.items];
            if (isEn && item.items.some(subItem => subItem.enOrder !== undefined)) {
                sortedItems = sortedItems.sort((a, b) => a.enOrder - b.enOrder);
            }
            // For Chinese preview, keep original order - no sorting needed

            const dropdownItems = sortedItems.map(subItem => {
                const subText = isEn ? subItem.en : subItem.zh;

                // Handle nested items within dropdown items
                if (subItem.items && subItem.items.length > 0) {
                    const nestedItems = subItem.items.map(nestedItem => {
                        const nestedText = isEn ? nestedItem.en : nestedItem.zh;
                        return `
                            <li>
                                <a href="#" class="px-6 py-2 text-gray-600 hover:bg-gray-50 block whitespace-nowrap text-sm border-l-2 border-gray-200 ml-2">
                                    ${nestedText}
                                </a>
                            </li>
                        `;
                    }).join('');

                    return `
                        <li>
                            <div class="px-4 py-2 text-gray-700 font-medium text-sm whitespace-nowrap bg-gray-50">
                                ${subText}
                            </div>
                            ${nestedItems}
                        </li>
                    `;
                }

                return `
                    <li>
                        <a href="#" class="px-4 py-2 text-gray-700 hover:bg-gray-100 block whitespace-nowrap text-sm">
                            ${subText}
                        </a>
                    </li>
                `;
            }).join('');

            return `
                <li class="relative">
                    <div class="px-3 py-2 text-gray-700 font-medium text-sm cursor-pointer whitespace-nowrap border-b border-gray-300">
                        ${text}
                    </div>
                    <ul class="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-48 w-max opacity-100 visible">
                        ${dropdownItems}
                    </ul>
                </li>
            `;
        }

        return `
            <li>
                <a href="#" class="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm whitespace-nowrap">
                    ${text}
                </a>
            </li>
        `;
    }

    filterDropdownPaths(event) {
        const input = event.target;
        const inputValue = input.value.toLowerCase();
        const inputType = input.dataset.type;
        const inputIndex = input.dataset.index;
        const dropdown = document.getElementById(`dropdown-${inputType}-${inputIndex}`);

        if (!dropdown) return;

        // Show dropdown if hidden
        dropdown.classList.remove('hidden');

        // Filter options based on input value
        const options = dropdown.querySelectorAll('[data-path]');
        let visibleCount = 0;

        options.forEach(option => {
            const path = option.dataset.path.toLowerCase();
            if (path.includes(inputValue)) {
                option.style.display = 'block';
                visibleCount++;
            } else {
                option.style.display = 'none';
            }
        });

        // Hide dropdown if no matches
        if (visibleCount === 0 && inputValue.length > 0) {
            dropdown.classList.add('hidden');
        }
    }

    showFilteredDropdown(event) {
        const input = event.target;
        const inputType = input.dataset.type;
        const inputIndex = input.dataset.index;
        const dropdown = document.getElementById(`dropdown-${inputType}-${inputIndex}`);

        if (!dropdown) return;

        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(d => {
            if (d.id !== `dropdown-${inputType}-${inputIndex}`) {
                d.classList.add('hidden');
            }
        });

        // Show this dropdown
        dropdown.classList.remove('hidden');

        // Reset all options to be visible when focusing
        const options = dropdown.querySelectorAll('[data-path]');
        options.forEach(option => {
            option.style.display = 'block';
        });

        // Apply current filter if input has value
        if (input.value) {
            this.filterDropdownPaths(event);
        }
    }

    handleDropdownKeyboard(event) {
        const input = event.target;
        const inputType = input.dataset.type;
        const inputIndex = input.dataset.index;
        const dropdown = document.getElementById(`dropdown-${inputType}-${inputIndex}`);

        if (!dropdown || dropdown.classList.contains('hidden')) return;

        const visibleOptions = Array.from(dropdown.querySelectorAll('[data-path]')).filter(
            option => option.style.display !== 'none'
        );

        if (visibleOptions.length === 0) return;

        const currentHighlighted = dropdown.querySelector('.highlighted');
        let newIndex = -1;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (currentHighlighted) {
                    const currentIndex = visibleOptions.indexOf(currentHighlighted);
                    newIndex = Math.min(currentIndex + 1, visibleOptions.length - 1);
                } else {
                    newIndex = 0;
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                if (currentHighlighted) {
                    const currentIndex = visibleOptions.indexOf(currentHighlighted);
                    newIndex = Math.max(currentIndex - 1, 0);
                } else {
                    newIndex = visibleOptions.length - 1;
                }
                break;

            case 'Enter':
                event.preventDefault();
                if (currentHighlighted) {
                    currentHighlighted.click();
                } else if (visibleOptions.length === 1) {
                    visibleOptions[0].click();
                }
                return;

            case 'Escape':
                event.preventDefault();
                dropdown.classList.add('hidden');
                return;
        }

        // Update highlighting
        if (newIndex >= 0) {
            // Remove previous highlighting
            if (currentHighlighted) {
                currentHighlighted.classList.remove('highlighted', 'bg-blue-100');
            }

            // Add new highlighting
            const newHighlighted = visibleOptions[newIndex];
            newHighlighted.classList.add('highlighted', 'bg-blue-100');

            // Scroll into view
            newHighlighted.scrollIntoView({ block: 'nearest' });
        }
    }
}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NavbarEditor();
});
