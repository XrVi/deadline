// 获取弹窗和按钮元素
const newTaskBtn = document.getElementById('newTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementsByClassName('close')[0];
const addTaskBtn = document.getElementById('addTaskBtn');
const taskNameInput = document.getElementById('taskName');
const taskDeadlineInput = document.getElementById('taskDeadline');
const tasksList = document.getElementById('tasksList');

// 任务列表，用于检测重复任务
let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

// 页面加载时恢复任务
window.onload = function() {
    Object.keys(tasks).forEach(taskName => {
        const deadline = new Date(tasks[taskName]);
        createTask(taskName, deadline);
    });
};

// 打开弹窗
newTaskBtn.onclick = function() {
    taskModal.style.display = 'block';
};

// 关闭弹窗
closeModal.onclick = function() {
    taskModal.style.display = 'none';
};

// 添加任务时，检查是否重复
addTaskBtn.onclick = function() {
    const taskName = taskNameInput.value.trim();
    const deadline = new Date(taskDeadlineInput.value);

    // 检查任务是否重复
    if (tasks[taskName]) {
        alert('任务名称重复，请输入不同的任务名称');
        return;
    }

    // 检查任务名称和截止时间是否为空
    if (!taskName || isNaN(deadline)) {
        alert('请输入有效的任务名称和截止时间');
        return;
    }

    // 创建任务
    createTask(taskName, deadline);

    // 记录任务到localStorage
    tasks[taskName] = deadline;
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // 关闭弹窗并清空输入框
    taskModal.style.display = 'none';
    taskNameInput.value = '';
    taskDeadlineInput.value = '';
};

// 创建任务函数
function createTask(name, deadline) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';

    const taskNameDiv = document.createElement('div');
    taskNameDiv.className = 'task-name';
    taskNameDiv.textContent = name;

    const progressBarDiv = document.createElement('div');
    progressBarDiv.className = 'progress-bar';

    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress';
    progressDiv.setAttribute('start-time', new Date());

    progressBarDiv.appendChild(progressDiv);

    const timeLeftDiv = document.createElement('div');
    timeLeftDiv.className = 'time-left';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-task';
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = function() {
        taskDiv.remove();
        delete tasks[name];
        localStorage.setItem('tasks', JSON.stringify(tasks)); // 更新localStorage
    };

    taskDiv.appendChild(taskNameDiv);
    taskDiv.appendChild(progressBarDiv);
    taskDiv.appendChild(timeLeftDiv);
    taskDiv.appendChild(deleteBtn);
    tasksList.appendChild(taskDiv);

    // 初始化任务进度更新
    updateTaskProgress(deadline, progressDiv, timeLeftDiv);
    setInterval(() => {
        updateTaskProgress(deadline, progressDiv, timeLeftDiv);
    }, 50);
}

// 更新任务进度
function updateTaskProgress(deadline, progressDiv, timeLeftDiv) {
    const now = new Date();
    const totalTime = deadline - now;
    const totalDuration = deadline - new Date(progressDiv.getAttribute('start-time'));
    const percentage = Math.max((totalTime / totalDuration) * 100, 0);

    // 动态设置进度条宽度，保持任务过期后位置不变
    progressDiv.style.width = percentage > 0 ? percentage + '%' : '0%';

    // 设置颜色渐变
    if (percentage > 75) {
        progressDiv.style.backgroundColor = 'rgb(0, 128, 0)'; // 深绿色
    } else if (percentage > 50) {
        progressDiv.style.backgroundColor = 'rgb(255, 204, 0)'; // 深黄色
    } else if (percentage > 25) {
        progressDiv.style.backgroundColor = 'rgb(255, 140, 0)'; // 深橙色
    } else {
        progressDiv.style.backgroundColor = 'rgb(255, 0, 0)'; // 深红色
    }

    // 格式化时间为 00:00:0000
    const hoursLeft = String(Math.floor((totalTime / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    const minutesLeft = String(Math.floor((totalTime / (1000 * 60)) % 60)).padStart(2, '0');
    const secondsLeft = String(Math.floor((totalTime / 1000) % 60)).padStart(2, '0');
    const millisecondsLeft = String(Math.floor((totalTime % 1000) / 10)).padStart(2, '0');

    // 设置时间文本
    timeLeftDiv.innerHTML = `${hoursLeft}:${minutesLeft}:${secondsLeft}<span class="milliseconds">${millisecondsLeft}</span>`;

    // 处理过期任务
    if (totalTime <= 0) {
        timeLeftDiv.innerHTML = 'Expired';
        timeLeftDiv.style.color = 'red';
        progressDiv.style.backgroundColor = 'red';
    }
}