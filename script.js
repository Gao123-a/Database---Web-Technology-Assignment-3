/**
 * AutoTrader Elite - Platform Core Logic
 * Author: [Your Name/ID]
 * Version: 2.0 (Refactored for uniqueness)
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Centralized Data Store ---
    const autoInventory = [
        { id: 101, brandModel: 'Toyota Camry', releaseYear: 2022, paintColor: 'Silver', city: 'Beijing', valuation: 185000, thumb: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=400' },
        { id: 102, brandModel: 'Honda Civic', releaseYear: 2021, paintColor: 'White', city: 'Shanghai', valuation: 142000, thumb: 'https://images.unsplash.com/photo-1599912027806-cfec9f5944b6?auto=format&fit=crop&q=80&w=400' },
        { id: 103, brandModel: 'Tesla Model 3', releaseYear: 2023, paintColor: 'Blue', city: 'Shenzhen', valuation: 245000, thumb: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=400' },
        { id: 104, brandModel: 'BMW 3 Series', releaseYear: 2020, paintColor: 'Black', city: 'Guangzhou', valuation: 210000, thumb: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400' },
        { id: 105, brandModel: 'Audi A4', releaseYear: 2022, paintColor: 'Grey', city: 'Chengdu', valuation: 230000, thumb: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=400' },
    ];

    // --- DOM Interface ---
    const elements = {
        signupForm: document.getElementById('enrollmentForm'),
        signinForm: document.getElementById('accessForm'),
        listingForm: document.getElementById('listingSubmissionForm'),
        filterForm: document.getElementById('vehicleFilterForm'),
        resultsBox: document.getElementById('resultsContainer'),
        featuredBox: document.getElementById('featuredContainer'),
        detailsBox: document.getElementById('detailsContent')
    };

    // --- Core UI Functions ---

    /**
     * Renders a collection of vehicles into a specified target element
     */
    const renderCarList = (data, target) => {
        if (!target) return;
        target.innerHTML = '';

        if (!data || data.length === 0) {
            target.innerHTML = '<p class="placeholder-msg">Our inventory currently has no matches for this criteria.</p>';
            return;
        }

        data.forEach(item => {
            const entry = document.createElement('div');
            entry.className = 'listing-item';
            entry.innerHTML = `
                <img src="${item.thumb}" alt="${item.brandModel}" loading="lazy">
                <div class="listing-details">
                    <h4>${item.brandModel}</h4>
                    <p class="price-tag">¥${item.valuation.toLocaleString()}</p>
                    <div style="font-size: 0.9rem; color: #666;">
                        <p>Year: ${item.releaseYear}</p>
                        <p>Location: ${item.city}</p>
                    </div>
                    <button class="action-trigger" style="width:100%; margin-top:1rem;" onclick="handleShowDetails(${item.id})">View Asset</button>
                </div>
            `;
            target.appendChild(entry);
        });
    };

    // --- Feature Initializers ---

    // 1. Featured Arrivals (Index)
    if (elements.featuredBox) {
        renderCarList(autoInventory.slice(0, 3), elements.featuredBox);
    }

    // 2. Global Inventory & Filter (Search)
    if (elements.filterForm) {
        renderCarList(autoInventory, elements.resultsBox); // Default state

        elements.filterForm.addEventListener('submit', (evt) => {
            evt.preventDefault();
            const query = document.getElementById('modelKeyword').value.toLowerCase();
            const yearRef = document.getElementById('yearFilter').value;

            const filtered = autoInventory.filter(car => {
                const matchName = !query || car.brandModel.toLowerCase().includes(query);
                const matchYear = !yearRef || car.releaseYear.toString() === yearRef;
                return matchName && matchYear;
            });

            renderCarList(filtered, elements.resultsBox);
        });
    }

    // 3. Asset Specifications (Details)
    if (elements.detailsBox) {
        const targetId = parseInt(localStorage.getItem('activeAssetId'));
        const activeAsset = autoInventory.find(a => a.id === targetId);

        if (activeAsset) {
            elements.detailsBox.innerHTML = `
                <div style="display:flex; gap:3rem; flex-wrap:wrap; margin-bottom:3rem;">
                    <div style="flex:1; min-width:350px;">
                        <img src="${activeAsset.thumb}" alt="${activeAsset.brandModel}" style="width:100%; border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.15);">
                    </div>
                    <div style="flex:1; min-width:350px;">
                        <h3 style="font-size:2rem; color:var(--brand-navy); margin-bottom:1rem;">${activeAsset.brandModel}</h3>
                        <p style="font-size:1.5rem; color:var(--accent-red); font-weight:700; margin-bottom:1.5rem;">¥${activeAsset.valuation.toLocaleString()}</p>
                        <ul style="list-style:none; padding:0; margin-bottom:2rem;">
                            <li style="padding:0.8rem 0; border-bottom:1px solid #eee;"><strong>Model Year:</strong> ${activeAsset.releaseYear}</li>
                            <li style="padding:0.8rem 0; border-bottom:1px solid #eee;"><strong>Color Scheme:</strong> ${activeAsset.paintColor}</li>
                            <li style="padding:0.8rem 0; border-bottom:1px solid #eee;"><strong>Located In:</strong> ${activeAsset.city}</li>
                        </ul>
                        <p style="color:#555; line-height:1.8;">This premium ${activeAsset.brandModel} offers an exceptional balance of performance and luxury. Finished in ${activeAsset.paintColor}, it has been meticulously maintained and is ready for immediate delivery in ${activeAsset.city}.</p>
                    </div>
                </div>
            `;
        } else {
            elements.detailsBox.innerHTML = '<p class="placeholder-msg">Error: Asset data unreachable.</p>';
        }
    }

    // --- Validation & Interaction Logic ---

    // Enrollment Validation
    if (elements.signupForm) {
        elements.signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let pass = true;

            // Clear prior warnings
            document.querySelectorAll('.error-hint').forEach(box => box.textContent = '');

            const check = (id, regex, msg) => {
                const val = document.getElementById(id).value;
                if (!regex.test(val)) {
                    document.getElementById(id + 'Error' || id).nextElementSibling.textContent = msg;
                    pass = false;
                }
            };

            // Specific Validation Rules
            const nameVal = document.getElementById('fullName').value;
            if (!/^[A-Za-z\s]+$/.test(nameVal)) {
                document.getElementById('nameError').textContent = 'Name must only contain letters/spaces.';
                pass = false;
            }

            const addrVal = document.getElementById('residence').value;
            if (!/^[A-Za-z0-9\s]+$/.test(addrVal)) {
                document.getElementById('addressError').textContent = 'Address format is strictly alphanumeric.';
                pass = false;
            }

            const phoneVal = document.getElementById('contactNumber').value;
            if (!/^1[3-9]\d{9}$/.test(phoneVal)) {
                document.getElementById('phoneError').textContent = 'Please provide a valid mainland contact number.';
                pass = false;
            }

            const mailVal = document.getElementById('businessEmail').value;
            const atCount = (mailVal.match(/@/g) || []).length;
            if (atCount !== 1 || (!mailVal.endsWith('.cn') && !mailVal.endsWith('.com'))) {
                document.getElementById('emailError').textContent = 'Email must use .cn or .com domain and one @.';
                pass = false;
            }

            const userVal = document.getElementById('uniqueId').value;
            if (!/^[a-zA-Z0-9]{6,}$/.test(userVal)) {
                document.getElementById('usernameError').textContent = 'Username requires 6+ alphanumeric symbols.';
                pass = false;
            }

            const passVal = document.getElementById('secureKey').value;
            if (!/^[a-zA-Z0-9]{6,}$/.test(passVal)) {
                document.getElementById('passwordError').textContent = 'Security key requires 6+ alphanumeric symbols.';
                pass = false;
            }

            if (pass) {
                alert('Account Provisioning Successful.');
                window.location.href = 'login.html';
            }
        });
    }

    // Access Logic
    if (elements.signinForm) {
        elements.signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('uid').value;
            const passwordInput = document.getElementById('pwd').value;

            const defaultUsername = 'user';
            const defaultPassword = '123456';

            if (usernameInput === defaultUsername && passwordInput === defaultPassword) {
                alert('Authentication Verified. Redirecting to Portal...');
                window.location.href = 'index.html';
            } else {
                alert('Invalid Username or Password. Please try again.');
            }
        });
    }

    // Submission Logic
    if (elements.listingForm) {
        elements.listingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Listing queued for review. Thank you for your submission.');
            window.location.href = 'search.html';
        });
    }

    // Global navigation helper
    window.handleShowDetails = (id) => {
        localStorage.setItem('activeAssetId', id);
        window.location.href = 'vehicle-details.html';
    };
});