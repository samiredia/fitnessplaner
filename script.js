const form = document.querySelector('#fitness-form');
const errorBox = document.querySelector('#form-error');
const resultsSection = document.querySelector('#results');
const nutritionBody = document.querySelector('#nutrition-body');
const workoutGrid = document.querySelector('#workout-grid');

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const meals = {
  breakfast: [
    'Овсянка + греческий йогурт + ягоды + орехи',
    'Омлет из 3 яиц + цельнозерновой тост + овощи',
    'Творог 5% + банан + семена чиа',
    'Протеиновый смузи + тост с арахисовой пастой',
    'Рисовая каша + сывороточный протеин + ягоды',
    'Сырники из творога + нежирный йогурт',
    'Гречка + яичница + салат из овощей'
  ],
  lunch: [
    'Куриная грудка + бурый рис + салат + оливковое масло',
    'Индейка + киноа + запеченные овощи',
    'Говядина + гречка + зелень',
    'Лосось + картофель + салат',
    'Тефтели из индейки + булгур + овощи',
    'Курица терияки (легкая) + рис + брокколи',
    'Паста из твердых сортов + тунец + томаты'
  ],
  dinner: [
    'Белая рыба + овощи гриль + кус-кус',
    'Творог/скир + ягоды + миндаль',
    'Куриное филе + рататуй + киноа',
    'Омлет + салат + цельнозерновой хлеб',
    'Говядина тушеная + овощи + фасоль',
    'Запеченная индейка + салат + авокадо',
    'Лосось + спаржа + дикий рис'
  ],
  snack: [
    'Яблоко + протеиновый батончик',
    'Кефир + орехи',
    'Протеин + банан',
    'Йогурт без сахара + ягоды',
    'Творог + мёд (немного)',
    'Хлебцы + арахисовая паста',
    'Фрукт + горсть орехов'
  ]
};

const workoutTemplates = {
  gym: [
    {
      day: 'День 1: Ноги + грудь',
      plan: [
        'Присед со штангой: 4x6-10',
        'Жим штанги лёжа: 4x6-10',
        'Жим ногами: 3x10-12',
        'Выпады с гантелями: 3x10 на ногу',
        'Планка: 3x40-60 сек'
      ]
    },
    {
      day: 'День 2: Спина + плечи',
      plan: [
        'Тяга верхнего блока: 4x8-12',
        'Тяга штанги в наклоне: 4x6-10',
        'Жим гантелей сидя: 3x8-12',
        'Тяга каната к лицу: 3x12-15',
        'Скручивания: 3x15-20'
      ]
    },
    {
      day: 'День 3: Фулбоди + кондиция',
      plan: [
        'Становая тяга: 4x5-8',
        'Жим гантелей на наклонной: 3x8-12',
        'Тяга гантели одной рукой: 3x10-12',
        'Гиперэкстензия: 3x12-15',
        'Кардио интервалы: 12-18 минут'
      ]
    }
  ],
  home: [
    {
      day: 'День 1: Ноги + кор',
      plan: [
        'Приседания с гантелей/гирей: 4x10-15',
        'Болгарские выпады: 3x10 на ногу',
        'Ягодичный мост: 4x12-15',
        'Планка + боковая планка: 3 круга',
        'Быстрая ходьба или скакалка: 15 минут'
      ]
    },
    {
      day: 'День 2: Верх тела',
      plan: [
        'Отжимания: 4xмаксимум в технике',
        'Тяга резинки/гантели к поясу: 4x10-15',
        'Жим гантелей вверх: 3x10-12',
        'Разведения в стороны: 3x12-15',
        'Скручивания + велосипед: 3 круга'
      ]
    },
    {
      day: 'День 3: Фулбоди HIIT',
      plan: [
        'Круг: присед + отжимание + тяга + выпады (4 раунда)',
        'Махи гирей/гантелью: 4x15',
        'Берпи (или облегченный вариант): 4x10-12',
        'Планка на локтях: 3x45 сек',
        'Заминка и растяжка: 8-10 минут'
      ]
    }
  ]
};

workoutTemplates.mixed = [
  workoutTemplates.gym[0],
  workoutTemplates.home[1],
  workoutTemplates.gym[2]
];

function round(value) {
  return Math.round(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getGoalValidation(goal, currentWeight, targetWeight) {
  if (goal === 'lose' && targetWeight >= currentWeight) {
    return 'Для цели похудения целевой вес должен быть меньше текущего.';
  }

  if (goal === 'gain' && targetWeight <= currentWeight) {
    return 'Для набора массы целевой вес должен быть больше текущего.';
  }

  return '';
}

function calculateTargets(data) {
  const sexOffset = data.sex === 'male' ? 5 : -161;
  const bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + sexOffset;
  const tdee = bmr * data.activity;

  let calories = tdee;
  if (data.goal === 'lose') {
    calories *= data.preserveMuscle ? 0.85 : 0.8;
  } else if (data.goal === 'gain') {
    calories *= data.preserveMuscle ? 1.08 : 1.12;
  } else {
    calories *= 0.97;
  }

  const minCalories = data.sex === 'male' ? 1600 : 1300;
  calories = Math.max(minCalories, calories);

  let proteinPerKg = 1.9;
  if (data.goal === 'lose') {
    proteinPerKg = data.preserveMuscle ? 2.2 : 2;
  } else if (data.goal === 'gain') {
    proteinPerKg = data.preserveMuscle ? 2 : 1.8;
  }

  const fatPerKg = data.goal === 'gain' ? 1 : data.goal === 'maintain' ? 0.9 : 0.8;

  let protein = proteinPerKg * data.weight;
  let fat = fatPerKg * data.weight;
  let carbs = (calories - protein * 4 - fat * 9) / 4;

  if (carbs < 95) {
    carbs = 95;
    fat = Math.max(45, (calories - protein * 4 - carbs * 4) / 9);
  }

  calories = round(calories);
  protein = round(protein);
  fat = round(fat);
  carbs = round(carbs);

  const weightDelta = Math.abs(data.targetWeight - data.weight);
  const weeklyRate = data.goal === 'gain' ? 0.25 : 0.5;
  const estimatedWeeks = data.goal === 'maintain' ? 0 : Math.max(1, Math.ceil(weightDelta / weeklyRate));

  return {
    calories,
    protein,
    fat,
    carbs,
    estimatedWeeks
  };
}

function generateNutritionPlan(targets) {
  const caloriesPattern = [-40, 60, -20, 40, -50, 70, -30];
  const proteinPattern = [0, 4, -2, 3, -3, 5, -2];
  const fatPattern = [0, -3, 2, -2, 3, -1, 2];

  return daysOfWeek.map((day, index) => {
    const kcal = clamp(targets.calories + caloriesPattern[index], targets.calories - 120, targets.calories + 120);
    const protein = Math.max(80, targets.protein + proteinPattern[index]);
    const fat = Math.max(40, targets.fat + fatPattern[index]);
    const carbs = Math.max(90, round((kcal - protein * 4 - fat * 9) / 4));

    return {
      day,
      kcal,
      protein,
      fat,
      carbs,
      menu: [
        meals.breakfast[index],
        meals.lunch[index],
        meals.dinner[index],
        meals.snack[index]
      ]
    };
  });
}

function renderSummary(name, data, targets) {
  document.querySelector('#daily-calories').textContent = `${targets.calories} ккал`;
  document.querySelector('#daily-protein').textContent = `${targets.protein} г`;
  document.querySelector('#daily-fat').textContent = `${targets.fat} г`;
  document.querySelector('#daily-carbs').textContent = `${targets.carbs} г`;

  const titleName = name ? `${name}, ` : '';
  const goalText = data.goal === 'lose' ? 'снижения веса' : data.goal === 'gain' ? 'набора массы' : 'поддержания формы';

  const timelineText = data.goal === 'maintain'
    ? `${titleName}для поддержания формы придерживайся этого плана минимум 8-12 недель и отслеживай вес/объемы раз в неделю.`
    : `${titleName}ориентировочный срок для цели: ${targets.estimatedWeeks} нед. при стабильном соблюдении питания и 3 тренировках в неделю (${goalText}).`;

  document.querySelector('#timeline-text').textContent = timelineText;
}

function renderNutrition(plan) {
  nutritionBody.innerHTML = plan
    .map((dayPlan) => {
      const menu = dayPlan.menu.map((item) => `<li>${item}</li>`).join('');
      return `
        <tr>
          <td><strong>${dayPlan.day}</strong></td>
          <td>${dayPlan.kcal}</td>
          <td>${dayPlan.protein} г</td>
          <td>${dayPlan.fat} г</td>
          <td>${dayPlan.carbs} г</td>
          <td><ul class="menu-list">${menu}</ul></td>
        </tr>
      `;
    })
    .join('');
}

function adjustWorkoutByGoal(plan, goal, preserveMuscle) {
  return plan.map((dayBlock) => {
    const notes = [];

    if (goal === 'lose') {
      notes.push(preserveMuscle ? 'После силовой: 15-20 минут кардио в умеренном темпе.' : 'После тренировки: 20-30 минут кардио.');
      notes.push('Отдых между подходами: 60-90 сек.');
    } else if (goal === 'gain') {
      notes.push('Работай с прогрессивной нагрузкой: +1-2 повторения или +2.5 кг каждую неделю.');
      notes.push('Отдых между подходами: 90-150 сек.');
    } else {
      notes.push('Поддерживай технику и среднюю интенсивность.');
      notes.push('Отдых между подходами: 60-90 сек.');
    }

    return {
      day: dayBlock.day,
      plan: [...dayBlock.plan, ...notes]
    };
  });
}

function renderWorkout(workoutPlan) {
  workoutGrid.innerHTML = workoutPlan
    .map((dayBlock) => {
      const items = dayBlock.plan.map((item) => `<li>${item}</li>`).join('');
      return `
        <article class="workout-card">
          <h4>${dayBlock.day}</h4>
          <ul>${items}</ul>
        </article>
      `;
    })
    .join('');
}

function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const sex = String(formData.get('sex'));
  const age = Number(formData.get('age'));
  const height = Number(formData.get('height'));
  const weight = Number(formData.get('weight'));
  const targetWeight = Number(formData.get('targetWeight'));
  const goal = String(formData.get('goal'));
  const activity = Number(formData.get('activity'));
  const trainingStyle = String(formData.get('trainingStyle'));
  const preserveMuscle = Boolean(formData.get('preserveMuscle'));

  if (!age || !height || !weight || !targetWeight) {
    errorBox.textContent = 'Заполни все обязательные поля.';
    return;
  }

  const validationError = getGoalValidation(goal, weight, targetWeight);
  if (validationError) {
    errorBox.textContent = validationError;
    return;
  }

  errorBox.textContent = '';

  const userData = {
    sex,
    age,
    height,
    weight,
    targetWeight,
    goal,
    activity,
    trainingStyle,
    preserveMuscle
  };

  const targets = calculateTargets(userData);
  const nutritionPlan = generateNutritionPlan(targets);
  const workoutBase = workoutTemplates[trainingStyle] || workoutTemplates.gym;
  const workoutPlan = adjustWorkoutByGoal(workoutBase, goal, preserveMuscle);

  renderSummary(name, userData, targets);
  renderNutrition(nutritionPlan);
  renderWorkout(workoutPlan);

  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (form) {
  form.addEventListener('submit', handleSubmit);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.14
  }
);

document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));
