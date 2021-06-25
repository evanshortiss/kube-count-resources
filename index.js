'use strict';

/**
 * @typedef {Object} Resources
 * @property {String} cpu
 * @property {String} memory
 */

/**
 * @typedef {Object} CountResultContainer
 * @property {number} cpu
 * @property {number} memory
 */

/**
 *
 * @param {Object} CountResult
 * @property {CountResultContainer} limits
 * @property {CountResultContainer} requests
 */

/**
 * Count the CPU and Memory usage for the given Deployments/DeploymentConfigs.
 * @param {Buffer|String} json
 * @returns CountResult
 */
module.exports = function count(json) {
  try {
    const data = JSON.parse(json.toString());

    if (!data.kind || data.kind.toLowerCase() !== 'list') {
      throw new Error(`Provided JSON was not of "kind: List"`);
    }

    return countResources(data);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error('Failed to parse provided JSON string');
    } else {
      throw e;
    }
  }
};

const UNITS = {
  MEMORY: {
    K: Math.pow(1000, 1),
    Ki: Math.pow(1024, 1),

    // https://stackoverflow.com/questions/50804915/kubernetes-size-definitions-whats-the-difference-of-gi-and-g
    // i.e 129M * (1000^2) ~= 128974848 bytes
    M: Math.pow(1000, 2),
    Mi: Math.pow(1024, 2),

    G: Math.pow(1000, 3),
    Gi: Math.pow(1024, 3),

    T: Math.pow(1000, 4),
    Ti: Math.pow(1024, 4),

    T: Math.pow(1000, 5),
    Ti: Math.pow(1024, 5)
  }
};

/**
 *
 * @param {Array<Resources[]>} resources
 */
function countResources(resources) {
  const { items } = resources;

  /**
   * @type Array<{limits: Resources, requests: Resources}[]>
   */
  const requests = items.map((i) =>
    i.spec.template.spec.containers.map((c) => c.resources)
  );

  return requests.reduce(
    (counts, container) => {
      container.forEach((entry) => {
        if (!entry) return;

        if (entry.limits?.cpu) counts.limits.cpu += parseCpu(entry.limits.cpu);
        if (entry.limits?.memory)
          counts.limits.memory += parseMemory(entry.limits.memory);

        if (entry.requests?.cpu)
          counts.requests.cpu += parseCpu(entry.requests.cpu);
        if (entry.requests?.memory)
          counts.requests.memory += parseMemory(entry.requests.memory);
      });

      return counts;
    },
    {
      requests: { memory: 0, cpu: 0 },
      limits: { memory: 0, cpu: 0 }
    }
  );
}

/**
 * Given a CPU request value such as "500m", return a numeric representation
 * of that value as cores, i.e "500m" => 0.5
 * @param {String} str
 * @returns number
 */
function parseCpu(str) {
  const cores = parseFloat(str);
  const unit = str.replace(cores.toString(), '');

  if (unit !== 'm') {
    console.error(
      `Unknown CPU unit type of "${unit}" found in string "${str}"`
    );
  } else if (unit) {
    return cores / 1000;
  } else {
    return cores;
  }
}

/**
 * Given an input such as "600Mi", return a numeric representation of
 * that string where the value is gigabytes
 * @param {String} str
 * @returns number
 */
function parseMemory(str) {
  // Yikes, I know! Given "600Mi" this will return 600. If it works...
  const number = parseInt(str);
  const unit = str.replace(number.toString(), '');

  if (!unit) {
    // This is a raw number of bytes without a unit specifier
    return number / UNITS.MEMORY['Gi'];
  } else if (unit && UNITS.MEMORY[unit]) {
    return (number * UNITS.MEMORY[unit]) / UNITS.MEMORY['Gi'];
  } else {
    console.error(
      `Unknown memory unit type of "${unit}" found in string "${str}"`
    );
    process.exit(1);
  }
}
