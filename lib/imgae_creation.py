import matplotlib.pyplot as plt
import numpy as np
import os

# 创建图3-5：实验流程图
plt.figure(figsize=(10, 6))
stages = ['数据准备', '方法实施', '结果评估']
steps = [
    ['文件预处理', '格式检查', '数据集划分'],
    ['本文方法实施', 'python-pptx方法实施'],
    ['噪声标注', '指标计算', '结果分析']
]
colors = ['#4CAF50', '#2196F3', '#FFC107']

y_positions = [3, 2, 1]
plt.axhline(y=3.5, color='gray', linestyle='-', alpha=0.3)
plt.axhline(y=2.5, color='gray', linestyle='-', alpha=0.3)
plt.axhline(y=1.5, color='gray', linestyle='-', alpha=0.3)
plt.axhline(y=0.5, color='gray', linestyle='-', alpha=0.3)

for i, (stage, y_pos) in enumerate(zip(stages, y_positions)):
    plt.text(0, y_pos, stage, fontsize=14, ha='center', va='center', 
             bbox=dict(facecolor=colors[i], alpha=0.3, boxstyle='round,pad=0.5'))
    
    x_start = 1
    for step in steps[i]:
        x_end = x_start + len(step) * 0.15
        plt.arrow(x_start, y_pos, x_end - x_start - 0.1, 0, head_width=0.1, 
                 head_length=0.1, fc=colors[i], ec=colors[i])
        plt.text((x_start + x_end) / 2, y_pos, step, fontsize=10, ha='center', va='center')
        x_start = x_end + 0.5

plt.xlim(-0.5, 10)
plt.ylim(0, 4)
plt.axis('off')
plt.title('图3-5 实验流程图', fontsize=16)
plt.tight_layout()
plt.savefig('figures/experiment_flow.png', dpi=300, bbox_inches='tight')

# 创建图3-6：噪声比率对比图
plt.figure(figsize=(10, 6))
file_types = ['设备操作手册', '安全生产手册', '工艺培训讲义', '质量控制文档', '设备维护指南', '平均值']
our_method = [8.3, 7.5, 9.1, 8.7, 7.9, 8.3]
python_pptx = [32.7, 29.4, 35.2, 31.8, 30.5, 31.9]

x = np.arange(len(file_types))
width = 0.35

fig, ax = plt.subplots(figsize=(12, 7))
rects1 = ax.bar(x - width/2, our_method, width, label='本文方法', color='#4CAF50')
rects2 = ax.bar(x + width/2, python_pptx, width, label='python-pptx', color='#2196F3')

ax.set_ylabel('噪声比率 (%)', fontsize=12)
ax.set_title('图3-6 不同方法的噪声比率对比图', fontsize=16)
ax.set_xticks(x)
ax.set_xticklabels(file_types, rotation=15, ha='right')
ax.legend()

for rect in rects1:
    height = rect.get_height()
    ax.annotate(f'{height}%',
                xy=(rect.get_x() + rect.get_width()/2, height),
                xytext=(0, 3),
                textcoords='offset points',
                ha='center', va='bottom')

for rect in rects2:
    height = rect.get_height()
    ax.annotate(f'{height}%',
                xy=(rect.get_x() + rect.get_width()/2, height),
                xytext=(0, 3),
                textcoords='offset points',
                ha='center', va='bottom')

plt.tight_layout()
plt.savefig('figures/noise_ratio_comparison.png', dpi=300, bbox_inches='tight')

# 创建图3-7：噪声类型分布
plt.figure(figsize=(12, 7))
noise_types = ['模板噪声', '格式噪声', '结构噪声', '冗余噪声']
our_method_dist = [15.2, 12.8, 18.5, 53.5]
python_pptx_dist = [42.3, 35.7, 14.6, 7.4]

x = np.arange(len(noise_types))
width = 0.35

fig, ax = plt.subplots(figsize=(12, 7))
rects1 = ax.bar(x - width/2, our_method_dist, width, label='本文方法', color='#4CAF50')
rects2 = ax.bar(x + width/2, python_pptx_dist, width, label='python-pptx', color='#2196F3')

ax.set_ylabel('占总噪声比例 (%)', fontsize=12)
ax.set_title('图3-7 不同方法的噪声类型分布', fontsize=16)
ax.set_xticks(x)
ax.set_xticklabels(noise_types)
ax.legend()

for rect in rects1:
    height = rect.get_height()
    ax.annotate(f'{height}%',
                xy=(rect.get_x() + rect.get_width()/2, height),
                xytext=(0, 3),
                textcoords='offset points',
                ha='center', va='bottom')

for rect in rects2:
    height = rect.get_height()
    ax.annotate(f'{height}%',
                xy=(rect.get_x() + rect.get_width()/2, height),
                xytext=(0, 3),
                textcoords='offset points',
                ha='center', va='bottom')

plt.tight_layout()
plt.savefig('figures/noise_type_distribution.png', dpi=300, bbox_inches='tight')