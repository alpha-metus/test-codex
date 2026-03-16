const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const autopayForm = document.getElementById('autopayForm');
const autopayList = document.getElementById('autopayList');
const gmailPayments = document.getElementById('gmailPayments');
const fetchGmailBtn = document.getElementById('fetchGmail');
const monthlySpendNode = document.getElementById('monthlySpend');
const savingsRateNode = document.getElementById('savingsRate');
const insightList = document.getElementById('insightList');

const portfolioNode = document.getElementById('portfolio');
const suggestionNode = document.getElementById('suggestions');

const monthlyIncome = 4500;
const expenses = [];
const autopays = [];

const investmentPortfolio = [
  { name: 'Index Growth Fund', type: 'Mutual Fund', value: 8200, change: '+8.1%' },
  { name: 'Bluechip Leaders ETF', type: 'Mutual Fund', value: 4600, change: '+5.4%' },
  { name: 'NovaTech', type: 'Stock', value: 2400, change: '+11.2%' },
  { name: 'GreenGrid Energy', type: 'Stock', value: 1900, change: '+6.8%' },
];

const recommendedInvestments = [
  'Balanced Advantage Fund — lower volatility for stable growth',
  'US Large Cap Index ETF — diversify geographic exposure',
  'Healthcare Innovation Fund — thematic long-term opportunity',
  'Dividend Aristocrats Basket — build predictable cash flow',
];

const rules = [
  { keys: ['uber', 'taxi', 'fuel', 'metro', 'bus', 'parking'], category: 'Transport', tags: ['commute', 'mobility'] },
  { keys: ['pizza', 'food', 'restaurant', 'coffee', 'cafe', 'zomato', 'swiggy'], category: 'Food', tags: ['lifestyle', 'daily'] },
  { keys: ['rent', 'electricity', 'water', 'internet'], category: 'Bills', tags: ['fixed', 'monthly'] },
  { keys: ['netflix', 'spotify', 'prime', 'subscription'], category: 'Entertainment', tags: ['streaming'] },
  { keys: ['insurance', 'policy', 'emi', 'loan'], category: 'Finance', tags: ['obligation', 'autopay'] },
];

function formatCurrency(num) {
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function autoCategorize(description) {
  const normalized = description.toLowerCase();
  for (const rule of rules) {
    if (rule.keys.some((key) => normalized.includes(key))) {
      return { category: rule.category, tags: rule.tags };
    }
  }
  return { category: 'Miscellaneous', tags: ['review', 'uncategorized'] };
}

function recalcStats() {
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalAuto = autopays.reduce((sum, item) => sum + item.amount, 0);
  const combined = totalExpense + totalAuto;
  const savingsRate = Math.max(0, ((monthlyIncome - combined) / monthlyIncome) * 100);

  monthlySpendNode.textContent = formatCurrency(combined);
  savingsRateNode.textContent = `${savingsRate.toFixed(1)}%`;

  refreshInsights(totalExpense, totalAuto, savingsRate);
}

function refreshExpenses() {
  expenseList.innerHTML = expenses
    .slice()
    .reverse()
    .map(
      (item) => `
      <li>
        <div>
          <strong>${item.description}</strong>
          <div class="subtle">${item.date} · ${item.category}</div>
          <div class="badges">${item.tags.map((tag) => `<span class="badge">#${tag}</span>`).join('')}</div>
        </div>
        <strong class="negative">-${formatCurrency(item.amount)}</strong>
      </li>`
    )
    .join('');
}

function refreshAutopays() {
  autopayList.innerHTML = autopays
    .map(
      (item) => `
      <li>
        <div>
          <strong>${item.name}</strong>
          <span class="badge type">${item.type}</span>
        </div>
        <strong class="negative">-${formatCurrency(item.amount)}</strong>
      </li>`
    )
    .join('');
}

function refreshInsights(totalExpense, totalAuto, savingsRate) {
  const combined = totalExpense + totalAuto;
  const foodSpend = expenses
    .filter((item) => item.category === 'Food')
    .reduce((sum, item) => sum + item.amount, 0);

  const advice = [
    `You're spending ${((combined / monthlyIncome) * 100).toFixed(1)}% of income this month. Target < 70% for healthier cash flow.`,
    `Food spending is ${formatCurrency(foodSpend)}. Try a weekly cap and shift 15% to SIP investments.`,
    `Automate an emergency fund transfer of ${formatCurrency(monthlyIncome * 0.1)} monthly before discretionary spending.`,
  ];

  if (savingsRate < 20) {
    advice.unshift('Savings rate is below 20%. Consider pausing non-critical subscriptions and renegotiating recurring bills.');
  } else {
    advice.unshift('Great discipline! Savings rate is strong—consider increasing mutual fund SIPs by 5%.');
  }

  insightList.innerHTML = advice.map((line) => `<li>${line}</li>`).join('');
}

function renderInvestments() {
  portfolioNode.innerHTML = investmentPortfolio
    .map(
      (item) => `
      <li>
        <div>
          <strong>${item.name}</strong>
          <div class="subtle">${item.type}</div>
        </div>
        <div>
          <strong>${formatCurrency(item.value)}</strong>
          <div class="subtle">${item.change}</div>
        </div>
      </li>`
    )
    .join('');

  suggestionNode.innerHTML = recommendedInvestments
    .map((line) => `<li>${line}</li>`)
    .join('');
}

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const description = document.getElementById('description').value.trim();
  const amount = Number.parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;

  if (!description || Number.isNaN(amount) || amount <= 0 || !date) {
    return;
  }

  const metadata = autoCategorize(description);
  expenses.push({ description, amount, date, ...metadata });

  expenseForm.reset();
  document.getElementById('date').value = new Date().toISOString().slice(0, 10);

  refreshExpenses();
  recalcStats();
});

autopayForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('autoName').value.trim();
  const amount = Number.parseFloat(document.getElementById('autoAmount').value);
  const type = document.getElementById('autoType').value;

  if (!name || Number.isNaN(amount) || amount <= 0) {
    return;
  }

  autopays.push({ name, amount, type });
  autopayForm.reset();
  refreshAutopays();
  recalcStats();
});

fetchGmailBtn.addEventListener('click', () => {
  const fetched = [
    { merchant: 'Electric Co', amount: 84.2, mode: 'Autopay bill payment' },
    { merchant: 'Prime Video', amount: 14.99, mode: 'Subscription renewal' },
    { merchant: 'Health Protect Insurance', amount: 120, mode: 'Policy premium' },
  ];

  gmailPayments.innerHTML = fetched
    .map(
      (entry) => `
      <li>
        <div>
          <strong>${entry.merchant}</strong>
          <div class="subtle">${entry.mode}</div>
        </div>
        <strong class="negative">-${formatCurrency(entry.amount)}</strong>
      </li>`
    )
    .join('');
});

document.getElementById('date').value = new Date().toISOString().slice(0, 10);
renderInvestments();
refreshInsights(0, 0, 0);
