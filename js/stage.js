const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		this.generate_data_files();
		this.generate_pages();
	}

	generate_data_files() {
		const mapTable = this.parse_tsv(this.load('map.tsv'), false);
		const stageTable = this.parse_tsv(this.load('stage.tsv'), false);
		const groupData = JSON.parse(this.load('group.json'));
		const rewardData = JSON.parse(this.load('reward.json'));
		const enemyTable = this.parse_tsv(this.load('enemy.tsv'));

		const map = {};
		const stage = {};

		for (const entry of mapTable) {
			const [idx, ...data] = entry;
			map[parseInt(idx, 36)] = data;
		}
		map[-1] = Object.assign(groupData, {
			RWNAME: rewardData,
			ENAME: enemyTable.map(x => x.chinese_name),
		});

		for (const entry of stageTable) {
			const [idx, ...data] = entry;
			stage[parseInt(idx, 36)] = data;
		}

		this.write_json('stage.json', {
			map,
			stage,
		});
	}

	generate_pages() {
		const catData = this.parse_tsv(this.load('cat.tsv'));
		const eggs = catData.reduce((eggs, cat, id) => {
			if (cat.egg_1) {
				eggs[id] = [Number(cat.egg_1), Number(cat.egg_2)];
			}
			return eggs;
		}, {});
		this.write_template('html/anim.html', 'anim.html', {eggs});

		const {categories, conditions, material_drops} = JSON.parse(this.load('stage.json'));
		const egg_set = Object.keys(eggs).map(Number);
		this.write_template('html/stage.html', 'stage.html');
		this.write_template('html/stage2.html', 'stage2.html', {
			options: categories.official.map(entry => entry.name),
		});
		this.write_template('html/stage3.html', 'stage3.html', {
			options: categories.custom.map(entry => entry.name),
		});
		this.write_template('js/stage.js', 'stage.js', {
			stages_top: categories.default.map(entry => {
				const rv = [entry.name, entry.name_jp];
				if (entry.forbid_gold_cpu)
					rv.push(true);
				return rv;
			}),
			conditions,
			material_drops,
			egg_set,
		});
		this.write_template('js/stage2.js', 'stage2.js', {
			stages_top: categories.default.map(entry => entry.name),
			event_types: categories.official.map(entry => entry.maps),
			conditions,
			material_drops,
			egg_set,
		});
		this.write_template('js/stage3.js', 'stage3.js', {
			stages_top: categories.default.map(entry => entry.name),
			event_types: categories.custom.map(entry => entry.maps),
			conditions,
			material_drops,
			egg_set,
		});
		this.write_template('js/enemy.js', 'enemy.js', {
			stages_top: categories.default.map(entry => entry.name),
		});
	}
};
