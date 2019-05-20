class Fighter {
     constructor(name, health, attack, defense, divElem) {
          this.name = name;
          this.health = health;
          this.attack = attack;
          this.defense = defense;
          this.divElem = divElem;
     }
     getHitPower() {
          let criticalHitChance = 1 + Math.random();
          let power = this.attack * criticalHitChance;
          return power;
     }
     getBlockPower() {
          let dodgeChance = 1 + Math.random();
          let power = this.defense * dodgeChance;
          return power;
     }
}

export default Fighter;