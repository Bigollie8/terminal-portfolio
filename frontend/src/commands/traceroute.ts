import type { Command, CommandOutput, OutputLine, CommandContext } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateLatency = (base: number, variance: number): string => {
  const latency = base + Math.random() * variance;
  return latency.toFixed(3);
};

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
}

const fetchUserIpInfo = async (): Promise<IpInfo> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      org: data.org,
    };
  } catch {
    return { ip: 'unknown' };
  }
};

const generateHops = (userInfo: IpInfo, target: string) => {
  const ispName = userInfo.org?.replace(/^AS\d+\s*/, '').toLowerCase().replace(/[^a-z0-9]/g, '-') || 'isp';
  const city = userInfo.city?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'local';
  const region = userInfo.region?.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'rgn';

  return [
    { host: 'gateway.local', ip: '192.168.1.1', baseLatency: 1 },
    { host: `${city}-gw.${ispName}.net`, ip: userInfo.ip, baseLatency: 8 },
    { host: `core-rtr-1.${region}.${ispName}.net`, ip: `72.14.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, baseLatency: 14 },
    { host: `edge-rtr.${region}.${ispName}.net`, ip: `72.14.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, baseLatency: 18 },
    { host: 'ae-12.r21.nwrknj01.us.bb.gin.ntt.net', ip: '129.250.2.178', baseLatency: 24 },
    { host: 'ae-1.a00.asbnva02.us.bb.gin.ntt.net', ip: '129.250.4.13', baseLatency: 28 },
    { host: 'amazon-edge.ntt.net', ip: '129.250.66.170', baseLatency: 32 },
    { host: 'cloudfront-iad.aws.amazon.com', ip: '54.239.110.42', baseLatency: 36 },
    { host: target, ip: '143.204.215.89', baseLatency: 40 },
  ];
};

/**
 * traceroute command - traces route using user's real IP info
 */
export const tracerouteCommand: Command = {
  name: 'traceroute',
  description: 'Trace route to a network host',
  usage: 'traceroute [host]',
  execute: async (args: string[], context: CommandContext): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const target = args[0] || 'portfolio.basedsecurity.net';

    lines.push({
      id: generateId(),
      type: 'system',
      content: `traceroute to ${target}, 30 hops max, 60 byte packets`,
      timestamp: Date.now(),
    });

    // Fetch user's real IP info
    const userInfo = await fetchUserIpInfo();

    setTimeout(() => {
      const hops = generateHops(userInfo, target);
      let hopIndex = 0;

      const traceHop = () => {
        if (hopIndex >= hops.length) {
          context.addOutput([
            { id: generateId(), type: 'output', content: '', timestamp: Date.now() },
            { id: generateId(), type: 'system', content: 'Trace complete.', timestamp: Date.now() },
          ]);
          return;
        }

        const hop = hops[hopIndex];
        const hopNum = hopIndex + 1;

        const lat1 = generateLatency(hop.baseLatency, 5);
        const lat2 = generateLatency(hop.baseLatency, 5);
        const lat3 = generateLatency(hop.baseLatency, 5);

        const hopLine = ` ${hopNum.toString().padStart(2)}  ${hop.host} (${hop.ip})  ${lat1} ms  ${lat2} ms  ${lat3} ms`;

        context.addOutput([
          { id: generateId(), type: 'output', content: hopLine, timestamp: Date.now() },
        ]);

        hopIndex++;
        const delay = 200 + Math.random() * 400;
        setTimeout(traceHop, delay);
      };

      traceHop();
    }, 300);

    return { lines };
  },
};
