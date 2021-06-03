addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "⬤", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new ExpantaNum(0),
    }},
    color: "#4BDC13",
    requires: new ExpantaNum(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    softcap: new ExpantaNum(1e8), 
    softcapPower: new ExpantaNum(0.5), 
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        if (hasUpgrade("p", 22)) mult = mult.mul(2)
        return mult
    },
    passiveGeneration() {
      let effect = new ExpantaNum(2)
      if (hasUpgrade("e", 13)) mult = mult.mul(upgradeEffect("e", 13))
      if (hasMilestone("b", 1)) return effect
    },
    neverResets() {
      if (hasMilestone("b", 2)) return true
    },
        upgrades: {
            11: {
                title: "Generator of Genericness",
                description() { return  "Gain "+format(getPointGen())+" Points every second." },
                cost: new ExpantaNum(1),
                unlocked() { return player[this.layer].unlocked }, // The upgrade is only visible when this is true
            },
            12: {
                title: "Prestigious Power",
                description: "Point generation is faster based on your unspent Prestige Points.",
                cost: new ExpantaNum(2),
                unlocked() { return (hasUpgrade(this.layer, 11))},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].points.add(2).pow(0.5)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            13: {
                title: "Upgraded Upgrades",
                description: "Point generation is faster based on your Prestige Upgrades.",
                cost: new ExpantaNum(4),
                unlocked() { return (hasUpgrade(this.layer, 12))},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = ExpantaNum.pow(1.5, new ExpantaNum(player[this.layer].upgrades.length).add(0.5))
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            21: {
                title: "Growing Booster",
                description: "Point generation is faster based on your reset time.",
                cost: new ExpantaNum(15),
                unlocked() { return (hasUpgrade(this.layer, 12))},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let main = new ExpantaNum(player[this.layer].resetTime).div(25)
                    if (player.b.buyables[11].gt(0)) main = main.mul(tmp.b.buyables[11].effect)
                    let ret = ExpantaNum.pow(1.1, main).max(1)
                    if (ret.gte(1e7)) ret = ret.log10().mul(ExpantaNum.div(1e7, 7))
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            22: {
                title: "Prestigious Mastery",
                description: "Double prestige points.",
                cost: new ExpantaNum(30),
                unlocked() { return (hasUpgrade(this.layer, 13)&&hasUpgrade(this.layer, 21))},
            },
            23: {
                title: "Self Booster",
                description: "Point generation is faster based on points.",
                cost: new ExpantaNum(250),
                unlocked() { return (hasUpgrade(this.layer, 22))},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player.points.add(2).log10().add(1)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
        },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new ExpantaNum(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

addLayer("b", {
    name: "balancers", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "⌇", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new ExpantaNum(0),
		    best: new ExpantaNum(0),
        power: new ExpantaNum(0)
    }},
    color: "#346eeb",
    requires: new ExpantaNum(1e4), // Can be a function that takes requirement increases into account
    resource: "balancers", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    base: 4,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        if (hasUpgrade("e", 43)) mult = mult.div(upgradeEffect("e", 43))
        return mult
    },
    milestones: {
        0: {requirementDescription: "5 Balancers",
            done() {return player[this.layer].best.gte(5)}, // Used to determine when to give the milestone
            effectDescription: "Unlock Balancer Upgrades",
        },
        1: {requirementDescription: "7 Balancers",
            done() {return player[this.layer].best.gte(7)}, // Used to determine when to give the milestone
            effectDescription: "Gain 200% of prestige points on reset each second.",
        },
        2: {requirementDescription: "9 Balancers",
            done() {return player[this.layer].best.gte(9)}, // Used to determine when to give the milestone
            effectDescription: "The prestige layer never resets.",
        },
        3: {requirementDescription: "25 Balancers",
            done() {return player[this.layer].best.gte(25)}, // Used to determine when to give the milestone
            effectDescription: "Unlocks the Energy layer.",
        },
    },
        buyables: {
            showRespec: true,
            11: {
                title: "Growing Booster Balancer", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25)) x = x.pow(2).div(25)
                    let cost = ExpantaNum.pow(2, x.pow(1.5)).mul(5)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = ExpantaNum.pow(1.5, x.pow(1.15))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " balancing powers\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    <b>Growing Booster</b> scales " +format(tmp[this.layer].buyables[this.id].effect)+"x faster."
                },
                unlocked() { return hasMilestone(this.layer, 0) }, 
                canAfford() {
                    return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].power = player[this.layer].power.div(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
            },
            12: {
                title: "Balancer Powers Balancer", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25)) x = x.pow(2).div(25)
                    let cost = ExpantaNum.pow(1.7, x.pow(1.5)).mul(10)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = ExpantaNum.pow(1.75, x.pow(0.85))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " balancing powers\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    You gain Balancer Powers " +format(tmp[this.layer].buyables[this.id].effect)+"x faster."
                },
                unlocked() { return hasMilestone(this.layer, 0) }, 
                canAfford() {
                    return player[this.layer].power.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].power = player[this.layer].power.div(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
            },
        },
    /*neverResets() {
      return true
    },*/
    midsection: [
      ["display-text",
			  function() { 
          return 'You have ' + format(player.b.power) + ' Balancing Powers, which boosts Point generation by '+format(tmp.b.powerEff)+'x'}
      ]
    ],
    powerEff() {
			if (!player[this.layer].unlocked || !player[this.layer].power) return new ExpantaNum(1);
      let eff = player[this.layer].power.pow(1/3)
      return eff.add(1)
    },
		effect() {
			if (!player[this.layer].unlocked) return new ExpantaNum(0);
      let base = player[this.layer].points.max(0)
      if (base.gt(5)) base = base.mul(1.25).sub(1.25)
			let eff = ExpantaNum.pow(1.2, player[this.layer].points.max(0)).sub(1)//.max(0.2);
      if (player[this.layer].buyables[12].gt(0)) eff = eff.mul(tmp[this.layer].buyables[12].effect)
      if (hasUpgrade("e", 34)) eff = eff.mul(upgradeEffect("e", 34))
			return eff;
		},
		effectDescription() {
			return "which are generating "+format(tmp[this.layer].effect)+" Balancing Powers/sec"
		},
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new ExpantaNum(1)
    },
    onPrestige(gain) {
      player[this.layer].power = player[this.layer].power.div(new ExpantaNum(gain).add(player[this.layer].points).add(3).pow(3))
    },
    update(diff) {
      player[this.layer].power = player[this.layer].power.add(tmp[this.layer].effect.mul(diff))
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for balancers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: ["p"],
    layerShown(){return hasUpgrade("p", 23) || player[this.layer].unlocked}
})

addLayer("e", {
    name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "🗲", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new ExpantaNum(0),
		    matter: new ExpantaNum(0),
        moreDim1: new ExpantaNum(0),
        moreDim2: new ExpantaNum(0),
        moreDim3: new ExpantaNum(0),
        moreDim4: new ExpantaNum(0),
        moreDim5: new ExpantaNum(0),
        moreDim6: new ExpantaNum(0),
        moreDim7: new ExpantaNum(0),
        clickables: {[11]: new ExpantaNum(0), [12]: new ExpantaNum(0)}, // Optional default Clickable state
    }},
    color: "#ffc940",
    requires: new ExpantaNum(1e19), // Can be a function that takes requirement increases into account
    resource: "energy", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.12, // Prestige currency exponent
    softcap: new ExpantaNum(1e8), 
    softcapPower: new ExpantaNum(0.5), 
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
	      if (hasUpgrade("e", 12)) mult = mult.times(upgradeEffect("e", 12))
	      if (hasUpgrade("e", 21)) mult = mult.times(upgradeEffect("e", 21))
        return mult
    },
    passiveGeneration() {
      let effect = new ExpantaNum(0.01)
	    if (hasUpgrade("e", 14)) effect = effect.times(upgradeEffect("e", 14))
      return effect
    },
        upgrades: {
            11: {
                title: "Energetic Wrath",
                description: "Point generation is faster based on your unspent Energy.",
                cost: new ExpantaNum(1),
                unlocked() { return player[this.layer].unlocked},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].points.add(2).pow(0.65)
                    if (hasUpgrade("e", 41)) ret = ret.pow(1.15)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            12: {
                title: "Energetic Strength",
                description: "Energy gain is multiplied based on your unspent Energy.",
                cost: new ExpantaNum(25),
                unlocked() { return hasUpgrade(this.layer, 11)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].points.add(2).log10().add(1)
                    if (hasUpgrade(this.layer, 32)) ret = ret.pow(2)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            13: {
                title: "Energetic Speed",
                description: "Total Energy Upgrades multiply the Prestige Points gain speed.",
                cost: new ExpantaNum(250),
                unlocked() { return hasUpgrade(this.layer, 12)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = new ExpantaNum(player[this.layer].upgrades.length).add(1).pow(0.5)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            14: {
                title: "Energetic Telekinesis",
                description: "Total Energy Upgrades multiply Energy generation.",
                cost: new ExpantaNum(250),
                unlocked() { return hasUpgrade(this.layer, 12)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = new ExpantaNum(player[this.layer].upgrades.length).add(1).pow(1.045)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            15: {
                title: "Energetic Psyche",
                description: "Unlock Matter Dimensions.",
                cost: new ExpantaNum(2500),
                unlocked() { return hasUpgrade(this.layer, 13) && hasUpgrade(this.layer, 14)},
            },
            21: {
                title: "Emergent Behaviour",
                description: "Energy gain is multiplied based on matter.",
                cost: new ExpantaNum(500),
                unlocked() { return hasUpgrade(this.layer, 15)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].matter.add(2).log10().add(1)
                    if (hasUpgrade(this.layer, 42)) ret = ret.pow(2)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            22: {
                title: "Scourge Dimension",
                description: "All Matter Dimension generation is multiplied based on energy.",
                cost: new ExpantaNum(4000),
                unlocked() { return hasUpgrade(this.layer, 21)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].points.add(2).pow(0.1)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            23: {
                title: "Unbalanced",
                description: "Quadruple 4th Matter Dimension effect.",
                cost: new ExpantaNum(15000),
                unlocked() { return hasUpgrade(this.layer, 22)},
            },
            24: {
                title: "Meta Multipliers",
                description: "Add 1 to the Matter Dimension multiplier per cost.",
                cost: new ExpantaNum(20000),
                unlocked() { return hasUpgrade(this.layer, 23)},
            },
            25: {
                title: "Boosting Powers",
                description: "Unlock Tickspeed Upgrades.",
                cost: new ExpantaNum(40000),
                unlocked() { return hasUpgrade(this.layer, 24)},
            },
            31: {
                title: "Meta Wrath",
                description: "All Matter Dimension generation is multiplied based on matter.",
                cost: new ExpantaNum(35000),
                unlocked() { return hasUpgrade(this.layer, 25)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].matter.add(2).log10().add(1)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            32: {
                title: "Meta Strength",
                description: "Square <b>Energetic Strength</b>.",
                cost: new ExpantaNum(50000),
                unlocked() { return hasUpgrade(this.layer, 31)},
            },
            33: {
                title: "Meta Speed",
                description: "Add 0.01 to the Tickspeed Upgrades base.",
                cost: new ExpantaNum(90000),
                unlocked() { return hasUpgrade(this.layer, 32)},
            },
            34: {
                title: "Meta Telekinesis",
                description: "Matter multiplies Balancing Powers gain.",
                cost: new ExpantaNum(1500000),
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].matter.add(2).log10().add(1).pow(2)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
                unlocked() { return hasUpgrade(this.layer, 33)},
            },
            35: {
                title: "Meta Psyche",
                description: "Unlock Matter Boosters.",
                cost: new ExpantaNum(2e6),
                unlocked() { return hasUpgrade(this.layer, 34)},
            },
            41: {
                title: "<i>DIMENSION SHIFT</i>",
                description: "Unlock the 5th Matter Dimension, and raise Energetic Wrath to the power of 1.15.",
                cost: new ExpantaNum(5e6),
                unlocked() { return hasUpgrade(this.layer, 35)},
            },
            42: {
                title: "<i>Heavenly Pellets</i>",
                description: "Unlock the 6th Matter Dimension, and square <b>Emergent Behavior</b>.",
                cost: new ExpantaNum(1e7),
                unlocked() { return hasUpgrade(this.layer, 41)},
            },
            43: {
                title: "<i>Very Much Aarexy</i>",
                description: "Unlock the 7th Matter Dimension & divide Balancer cost based on Matter.",
                cost: new ExpantaNum(2e9),
                unlocked() { return hasUpgrade(this.layer, 42)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].matter.add(1).root(10).div(5).cbrt().add(1)
                    return ret;
                },
                effectDisplay() { return "/"+format(this.effect()) }, // Add formatting to the effect
            },
        },
        matterShit() {
          let shit = new ExpantaNum(2)
          if (hasUpgrade("e", 24)) shit = shit.add(1)
          return shit
        },
        buyables: {
            11: {
                title: "1st Matter Dimension", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let coster = new ExpantaNum(x)
                    if (coster.eq(0)) return new ExpantaNum(0)
                    if (coster.gt(10)) coster = coster.pow(2).div(10)
                    let cost = ExpantaNum.pow(10, coster)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = new ExpantaNum(x).add(player[this.layer].moreDim1)
                    eff = eff.mul(ExpantaNum.pow(layers[this.layer].matterShit(), x.sub(1)))
	                  eff = eff.mul(layers.e.getAllmatterMults())
                    return eff;
                }, 
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " matter\n\
                    Amount: " + player[this.layer].buyables[this.id] + (player[this.layer].moreDim1.gt(0) ? " + " + format(player[this.layer].moreDim1) : "")+ "\n\
                    Produces " + format(data.effect) + " matter per second"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].matter.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].matter = player[this.layer].matter.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px'},
            },
            12: {
                title: "2nd Matter Dimension", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let coster = new ExpantaNum(x)
                    if (coster.gt(10)) coster = coster.pow(2).div(10)
                    let cost = ExpantaNum.pow(100, coster).mul(100)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = new ExpantaNum(x).add(player[this.layer].moreDim2)
                    eff = eff.mul(ExpantaNum.pow(layers[this.layer].matterShit(), x.sub(1))).div(5)
	                  eff = eff.mul(layers.e.getAllmatterMults())
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " matter\n\
                    Amount: " + player[this.layer].buyables[this.id] + (player[this.layer].moreDim2.gt(0) ? " + " + format(player[this.layer].moreDim2) : "")+ "\n\
                    Produces " + format(data.effect) + " 1st matter dimensions per second"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].matter.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].matter = player[this.layer].matter.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px'},
            },
            13: {
                title: "3rd Matter Dimension", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let coster = new ExpantaNum(x)
                    if (coster.gt(10)) coster = coster.pow(2).div(10)
                    let cost = ExpantaNum.pow(10000, coster).mul(10000)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = new ExpantaNum(x).add(player[this.layer].moreDim3)
                    eff = eff.mul(ExpantaNum.pow(layers[this.layer].matterShit(), x.sub(1))).div(25)
	                  eff = eff.mul(layers.e.getAllmatterMults())
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " matter\n\
                    Amount: " + player[this.layer].buyables[this.id] + (player[this.layer].moreDim3.gt(0) ? " + " + format(player[this.layer].moreDim3) : "")+ "\n\
                    Produces " + format(data.effect) + " 2nd matter dimensions per second"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].matter.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].matter = player[this.layer].matter.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px'},
            },
            14: {
                title: "4th Matter Dimension", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let coster = new ExpantaNum(x)
                    if (coster.gt(10)) coster = coster.pow(2).div(10)
                    let cost = ExpantaNum.pow(1000000, coster).mul(1000000)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = new ExpantaNum(x).add(player[this.layer].moreDim4)
                    eff = eff.mul(ExpantaNum.pow(layers[this.layer].matterShit(), x.sub(1))).div(125)
	                  eff = eff.mul(layers.e.getAllmatterMults())
                    if (hasUpgrade("e", 23)) eff = eff.times(4)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " matter\n\
                    Amount: " + player[this.layer].buyables[this.id] + (player[this.layer].moreDim4.gt(0) ? " + " + format(player[this.layer].moreDim4) : "")+ "\n\
                    Produces " + format(data.effect) + " 3rd matter dimensions per second"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].matter.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].matter = player[this.layer].matter.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px'},
            },
            21: {
                title: "5th Matter Dimension", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let coster = new ExpantaNum(x)
                    if (coster.gt(10)) coster = coster.pow(2).div(10)
                    let cost = ExpantaNum.pow(1e22, coster).mul(1e8)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = new ExpantaNum(x).add(player[this.layer].moreDim5)
                    eff = eff.mul(ExpantaNum.pow(layers[this.layer].matterShit(), x.sub(1))).div(5**8)
	                  eff = eff.mul(layers.e.getAllmatterMults())
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " matter\n\
                    Amount: " + player[this.layer].buyables[this.id] + (player[this.layer].moreDim5.gt(0) ? " + " + format(player[this.layer].moreDim5) : "")+ "\n\
                    Produces " + format(data.effect) + " 4th matter dimensions per second"
                },
                unlocked() { return hasUpgrade(this.layer, 41) }, 
                canAfford() {
                    return player[this.layer].matter.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].matter = player[this.layer].matter.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px'},
            },
            22: {
                title: "6th Matter Dimension", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let coster = new ExpantaNum(x)
                    if (coster.gt(10)) coster = coster.pow(2).div(10)
                    let cost = ExpantaNum.pow(1e50, coster).mul(1e22)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = new ExpantaNum(x).add(player[this.layer].moreDim6)
                    eff = eff.mul(ExpantaNum.pow(layers[this.layer].matterShit(), x.sub(1))).div(5**14)
	                  eff = eff.mul(layers.e.getAllmatterMults())
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " matter\n\
                    Amount: " + player[this.layer].buyables[this.id] + (player[this.layer].moreDim6.gt(0) ? " + " + format(player[this.layer].moreDim6) : "")+ "\n\
                    Produces " + format(data.effect) + " 5th matter dimensions per second"
                },
                unlocked() { return hasUpgrade(this.layer, 42) }, 
                canAfford() {
                    return player[this.layer].matter.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].matter = player[this.layer].matter.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px'},
            },
            23: {
                title: "7th Matter Dimension", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let coster = new ExpantaNum(x)
                    if (coster.gt(10)) coster = coster.pow(2).div(10)
                    let cost = ExpantaNum.pow(1e75, coster).mul(1e36)
                    return cost
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a ExpantaNum
                    let eff = new ExpantaNum(x).add(player[this.layer].moreDim7)
                    eff = eff.mul(ExpantaNum.pow(layers[this.layer].matterShit(), x.sub(1))).div(5**15)
	                  eff = eff.mul(layers.e.getAllmatterMults())
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " matter\n\
                    Amount: " + player[this.layer].buyables[this.id] + (player[this.layer].moreDim7.gt(0) ? " + " + format(player[this.layer].moreDim7) : "")+ "\n\
                    Produces " + format(data.effect) + " 6th matter dimensions per second"
                },
                unlocked() { return hasUpgrade(this.layer, 43) }, 
                canAfford() {
                    return player[this.layer].matter.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].matter = player[this.layer].matter.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px'},
            },
        },
    clickables: {
        11: {
            title: "Matter Boosts", // Optional, displayed at the top in a larger font
            display() { // Everything else displayed in the buyable button after the title
                let data = getClickableState(this.layer, this.id)
                return "Matter Boosts: " + data + "\n\
                Multiplies all Matter Dimension gain by "+format(tmp[this.layer].clickables[this.id].effect)+"x.\n\
                Requires "+format(tmp[this.layer].clickables[this.id].goal)+" tickspeed upgrades."
            },
            goal() {
                let data = new ExpantaNum(getClickableState(this.layer, this.id))
                let cost = ExpantaNum.mul(9, data.add(1))
                return cost
            },
            effect() {
                let data = new ExpantaNum(getClickableState(this.layer, this.id))
              return ExpantaNum.pow(3, data)
            },
            unlocked() { return hasUpgrade(this.layer, 35) }, 
            canClick() {
                return player[this.layer].clickables[12].gte(tmp[this.layer].clickables[this.id].goal) },
            onClick() { 
                if (!player[this.layer].clickables[12].gte(tmp[this.layer].clickables[this.id].goal)) {
                  return
                } else {
                  doReset("e", true)
                  setClickableState(this.layer, this.id, new ExpantaNum(getClickableState(this.layer, this.id).add(1)))
                  setClickableState(this.layer, 12, new ExpantaNum(0))
                  player[this.layer].matter = new ExpantaNum(0)
                  player[this.layer].buyables[11] = new ExpantaNum(0)
                  player[this.layer].buyables[12] = new ExpantaNum(0)
                  player[this.layer].buyables[13] = new ExpantaNum(0)
                  player[this.layer].buyables[14] = new ExpantaNum(0)
                  player[this.layer].buyables[21] = new ExpantaNum(0)
                  player[this.layer].buyables[22] = new ExpantaNum(0)
                  player[this.layer].buyables[23] = new ExpantaNum(0)
                  player[this.layer].moreDim1 = new ExpantaNum(0)
                  player[this.layer].moreDim2 = new ExpantaNum(0)
                  player[this.layer].moreDim3 = new ExpantaNum(0)
                  player[this.layer].moreDim4 = new ExpantaNum(0)
                  player[this.layer].moreDim5 = new ExpantaNum(0)
                  player[this.layer].moreDim6 = new ExpantaNum(0)
                }
            },
            style() {
                return {'width': '150px', 'height': '150px'}
            },
        },
        12: {
            title: "Tickspeed Upgrades", // Optional, displayed at the top in a larger font
            display() { // Everything else displayed in the buyable button after the title
                let data = getClickableState(this.layer, this.id)
                return "Tickspeed Upgrades: " + data + "\n\
                Multiplies all Matter Dimension gain by "+format(tmp[this.layer].clickables[this.id].effect)+"x.\n\
                Costs "+format(tmp[this.layer].clickables[this.id].goal)+" matter."
            },
            goal() {
                let data = new ExpantaNum(getClickableState(this.layer, this.id))
                if (data.gt(70)) data = data.pow(1.05).div(70**0.05)
                let cost = ExpantaNum.pow(10, data.add(1))
                return cost
            },
            effect() {
                let data = new ExpantaNum(getClickableState(this.layer, this.id))
                let base = new ExpantaNum(1.07)
                if (hasUpgrade("e", 33)) base = base.add(0.01)
                return ExpantaNum.pow(base, data)
            },
            unlocked() { return hasUpgrade(this.layer, 25) }, 
            canClick() {
                return player[this.layer].matter.gte(tmp[this.layer].clickables[this.id].goal) },
            onClick() { 
                if (!player[this.layer].matter.gte(tmp[this.layer].clickables[this.id].goal)) {
                  return
                } else {
                  setClickableState(this.layer, this.id, new ExpantaNum(getClickableState(this.layer, this.id).add(1)))
                  player[this.layer].matter = player[this.layer].matter.sub(tmp[this.layer].clickables[this.id].goal)
                }
            },
            style() {
                return {'width': '150px', 'height': '150px'}
            },
        },
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new ExpantaNum(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for energy", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    getAllmatterMults() {
      let mult = new ExpantaNum(1)
	    if (hasUpgrade("e", 22)) mult = mult.times(upgradeEffect("e", 22))
	    if (hasUpgrade("e", 31)) mult = mult.times(upgradeEffect("e", 31))
	    if (hasUpgrade("e", 25)) mult = mult.times(tmp[this.layer].clickables[11].effect)
	    if (hasUpgrade("e", 35)) mult = mult.times(tmp[this.layer].clickables[12].effect)
      return mult
    },
        update(diff) {
          player[this.layer].moreDim1 = player[this.layer].moreDim1.add(tmp[this.layer].buyables[12].effect.times(diff))
          player[this.layer].moreDim2 = player[this.layer].moreDim2.add(tmp[this.layer].buyables[13].effect.times(diff))
          player[this.layer].moreDim3 = player[this.layer].moreDim3.add(tmp[this.layer].buyables[14].effect.times(diff))
          player[this.layer].moreDim4 = player[this.layer].moreDim4.add(tmp[this.layer].buyables[21].effect.times(diff))
          player[this.layer].moreDim5 = player[this.layer].moreDim5.add(tmp[this.layer].buyables[22].effect.times(diff))
          player[this.layer].moreDim6 = player[this.layer].moreDim6.add(tmp[this.layer].buyables[23].effect.times(diff))
          player[this.layer].matter = player[this.layer].matter.add(tmp[this.layer].buyables[11].effect.times(diff))
        },
    microtabs: {
        main: {
            "Main": {
                title: "Main",
                content: [
                    ["blank", "10px"],
                    ["blank", "10px"],
                    "upgrades",
                    ["blank", "10px"]
                ],
            },
            "Matter": {
                title: "Matter",
                unlocked: () => hasUpgrade("e", 15),
                content: [
                    ["blank", "10px"],
                    ["display-text", function() { return "You have "+format(player.e.matter)+" matter."}],
                    "buyables",
                    "clickables"
                ],
            },
        },
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["blank", "10px"],
        "h-line",
        ["microtabs", "main"],
        ["blank", "20px"],
    ],
    branches: ["p"],
    layerShown(){return hasMilestone("b", 3) || player[this.layer].unlocked}
})
