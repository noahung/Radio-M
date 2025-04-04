import { ImageSourcePropType } from 'react-native';

export type Station = {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  imageUrl?: ImageSourcePropType;
};

const stationImages: { [key: string]: ImageSourcePropType } = {
  '1': require('../assets/stations/1.png'),
  '2': require('../assets/stations/2.png'),
  '3': require('../assets/stations/3.png'),
  '4': require('../assets/stations/4.png'),
  '5': require('../assets/stations/5.png'),
  '6': require('../assets/stations/6.png'),
  '7': require('../assets/stations/7.png'),
  '8': require('../assets/stations/8.png'),
  '9': require('../assets/stations/9.png'),
  '10': require('../assets/stations/10.png'),
  '11': require('../assets/stations/11.png'),
  '12': require('../assets/stations/12.png'),
  '13': require('../assets/stations/13.png'),
  '14': require('../assets/stations/14.png'),
  '15': require('../assets/stations/15.png'),
  '16': require('../assets/stations/16.png'),
  '17': require('../assets/stations/17.png'),
  '19': require('../assets/stations/19.png'),
  '20': require('../assets/stations/20.png'),
  '21': require('../assets/stations/21.png'),
  '22': require('../assets/stations/22.png'),
  '23': require('../assets/stations/23.png'),
  '24': require('../assets/stations/24.png'),
  '25': require('../assets/stations/25.png'),
  '26': require('../assets/stations/26.png'),
  '27': require('../assets/stations/27.png'),
  '28': require('../assets/stations/28.png'),
  '29': require('../assets/stations/29.png'),
  '30': require('../assets/stations/30.png'),
  '31': require('../assets/stations/31.png'),
  '32': require('../assets/stations/32.png'),
  '33': require('../assets/stations/33.png'),
  '34': require('../assets/stations/34.png'),
  '35': require('../assets/stations/35.png'),
  '36': require('../assets/stations/36.png'),
  '38': require('../assets/stations/38.png'),
  '39': require('../assets/stations/39.png'),
  '40': require('../assets/stations/40.png'),
};

function tryGetStationImage(id: string): ImageSourcePropType | undefined {
  return stationImages[id];
}

export const stations: Station[] = [
  {
    id: '1',
    name: 'Friends FM',
    description: 'Your friendly music companion',
    streamUrl: 'https://stream-172.zeno.fm/rtt1xsez338uv',
    imageUrl: tryGetStationImage('1')
  },
  {
    id: '2',
    name: 'City FM',
    description: 'The pulse of the city',
    streamUrl: 'https://stream.zeno.fm/rq4ux25pyeruv',
    imageUrl: tryGetStationImage('2')
  },
  {
    id: '3',
    name: 'Shwe Ayeyar FM',
    description: 'Traditional Myanmar music',
    streamUrl: 'https://stream.zeno.fm/gvyz1utf4uhvv',
    imageUrl: tryGetStationImage('3')
  },
  {
    id: '4',
    name: 'Shwe Hinthar',
    description: 'Contemporary hits and classics',
    streamUrl: 'https://stream-172.zeno.fm/pxn7p5cbm48uv',
    imageUrl: tryGetStationImage('4')
  },
  {
    id: '5',
    name: 'Mingalar Par Radio',
    description: 'News and entertainment',
    streamUrl: 'https://stream-175.zeno.fm/hnsabdeu7k0uv',
    imageUrl: tryGetStationImage('5')
  },
  {
    id: '6',
    name: 'Dhamma',
    description: 'Buddhist teachings and meditation',
    streamUrl: 'https://stream-176.zeno.fm/v3awsfmhnchvv',
    imageUrl: tryGetStationImage('6')
  },
  {
    id: '7',
    name: 'MyaYoungChi Radio',
    description: 'Youth and modern culture',
    streamUrl: 'https://stream-174.zeno.fm/ggjbzeqpkawvv',
    imageUrl: tryGetStationImage('7')
  },
  {
    id: '8',
    name: 'Cherry FM',
    description: 'Pop and rock hits',
    streamUrl: 'https://stream-169.zeno.fm/4x8x3g06n48uv',
    imageUrl: tryGetStationImage('8')
  },
  {
    id: '9',
    name: 'Melody FM',
    description: 'Romantic and soft music',
    streamUrl: 'https://stream-175.zeno.fm/yajlk8od0tmuv',
    imageUrl: tryGetStationImage('9')
  },
  {
    id: '10',
    name: 'Nevermore Channel',
    description: 'Alternative and indie music',
    streamUrl: 'https://stream-176.zeno.fm/wh799nuwvchvv',
    imageUrl: tryGetStationImage('10')
  },
  {
    id: '11',
    name: 'ARAKAN FM',
    description: 'Arakan region music and culture',
    streamUrl: 'https://stream-175.zeno.fm/p9k212xkp2zuv',
    imageUrl: tryGetStationImage('11')
  },
  {
    id: '12',
    name: 'The Room Yangon',
    description: 'Talk shows and discussions',
    streamUrl: 'https://stream-172.zeno.fm/tfft925h5a0uv',
    imageUrl: tryGetStationImage('12')
  },
  {
    id: '13',
    name: 'MCOMMM',
    description: 'Community radio and local content',
    streamUrl: 'https://stream-175.zeno.fm/u4w6fu3nhm8uv',
    imageUrl: tryGetStationImage('13')
  },
  {
    id: '14',
    name: 'Sri Ksetra',
    description: 'Traditional Myanmar music',
    streamUrl: 'https://stream-172.zeno.fm/pdrht65hgdtuv',
    imageUrl: tryGetStationImage('14')
  },
  {
    id: '15',
    name: 'Relax Zone',
    description: 'Relaxing music and meditation',
    streamUrl: 'https://stream-173.zeno.fm/ji4wajqtih7tv',
    imageUrl: tryGetStationImage('15')
  },
  {
    id: '16',
    name: 'Burma Revolution Radio',
    description: 'News and political commentary',
    streamUrl: 'https://stream-173.zeno.fm/00m4g8wr1p8uv',
    imageUrl: tryGetStationImage('16')
  },
  {
    id: '17',
    name: 'Advent FM',
    description: 'Christian music and teachings',
    streamUrl: 'https://stream-176.zeno.fm/tus18w05na0uv',
    imageUrl: tryGetStationImage('17')
  },
  {
    id: '18',
    name: 'Arakan FM',
    description: 'Arakan region content',
    streamUrl: 'https://stream-173.zeno.fm/uhuyx8fve48uv',
    imageUrl: tryGetStationImage('18')
  },
  {
    id: '19',
    name: 'Myanmar',
    description: 'General Myanmar content',
    streamUrl: 'https://stream-173.zeno.fm/q9cw34n6a48uv',
    imageUrl: tryGetStationImage('19')
  },
  {
    id: '20',
    name: 'Heaven Life',
    description: 'Spiritual and religious content',
    streamUrl: 'https://stream-169.zeno.fm/ka3qyytcabjuv',
    imageUrl: tryGetStationImage('20')
  },
  {
    id: '21',
    name: 'Karen Gospel Radio',
    description: 'Karen gospel music and teachings',
    streamUrl: 'https://stream-171.zeno.fm/17ke6qyhtp8uv',
    imageUrl: tryGetStationImage('21')
  },
  {
    id: '22',
    name: 'Voice Sports News',
    description: 'Sports news and updates',
    streamUrl: 'https://stream-174.zeno.fm/zbh110758a0uv',
    imageUrl: tryGetStationImage('22')
  },
  {
    id: '23',
    name: 'Shwe90',
    description: '90s hits and classic pop',
    streamUrl: 'https://stream-164.zeno.fm/awh41anxg7atv',
    imageUrl: tryGetStationImage('23')
  },
  {
    id: '24',
    name: 'Myanmar Truckers FM',
    description: 'Music for the road',
    streamUrl: 'https://stream-176.zeno.fm/gh0t0wugy38uv',
    imageUrl: tryGetStationImage('24')
  },
  {
    id: '25',
    name: 'Springtime',
    description: 'Fresh and upbeat music',
    streamUrl: 'https://stream-163.zeno.fm/9500n7ywaq8uv',
    imageUrl: tryGetStationImage('25')
  },
  {
    id: '26',
    name: 'ABC Radio',
    description: 'International news coverage',
    streamUrl: 'https://stream-176.zeno.fm/o2mneumproruv',
    imageUrl: tryGetStationImage('26')
  },
  {
    id: '27',
    name: 'Jazz Live Radio',
    description: 'Live jazz performances',
    streamUrl: 'https://stream-176.zeno.fm/2txc199hsp8uv',
    imageUrl: tryGetStationImage('27')
  },
  {
    id: '28',
    name: 'Dr.Snail Band',
    description: 'Rock music and live performances',
    streamUrl: 'https://stream-163.zeno.fm/irtxizbdrnctv',
    imageUrl: tryGetStationImage('28')
  },
  {
    id: '29',
    name: 'MCOMM Country Live Radio',
    description: 'Country music live',
    streamUrl: 'https://stream-171.zeno.fm/k3cms4d6wp8uv',
    imageUrl: tryGetStationImage('29')
  },
  {
    id: '30',
    name: 'Burma Tamil Community',
    description: 'Tamil community content',
    streamUrl: 'https://stream-173.zeno.fm/cbk2avkrzc9uv',
    imageUrl: tryGetStationImage('30')
  },
  {
    id: '31',
    name: 'Star-Thura',
    description: 'Popular Myanmar hits',
    streamUrl: 'https://stream-164.zeno.fm/qalothzu8hutv',
    imageUrl: tryGetStationImage('31')
  },
  {
    id: '32',
    name: 'Ministry Of Trance RETRO Radio',
    description: 'Classic trance music',
    streamUrl: 'https://stream-164.zeno.fm/ny3mspp5tm0uv',
    imageUrl: tryGetStationImage('32')
  },
  {
    id: '33',
    name: 'Living Word Radio',
    description: 'Christian teachings and music',
    streamUrl: 'https://stream-172.zeno.fm/vvv2h7asn18uv',
    imageUrl: tryGetStationImage('33')
  },
  {
    id: '34',
    name: 'Chill Zone',
    description: 'Relaxing chill music',
    streamUrl: 'https://stream-163.zeno.fm/sy0a26km2uhvv',
    imageUrl: tryGetStationImage('34')
  },
  {
    id: '35',
    name: 'Ana Radio Channel',
    description: 'General entertainment',
    streamUrl: 'https://stream-173.zeno.fm/qmftv0ud4uhvv',
    imageUrl: tryGetStationImage('35')
  },
  {
    id: '36',
    name: 'T8 Radio',
    description: 'Contemporary pop hits',
    streamUrl: 'https://stream-172.zeno.fm/t073t8g9t68uv',
    imageUrl: tryGetStationImage('36')
  },
  {
    id: '37',
    name: 'Polytoria Radio',
    description: 'Gaming music and content',
    streamUrl: 'https://stream-165.zeno.fm/6ne0wu28vuhvv',
    imageUrl: tryGetStationImage('37')
  },
  {
    id: '38',
    name: 'karomeanchlorine FM',
    description: 'Alternative music mix',
    streamUrl: 'https://stream-163.zeno.fm/dm7nzm5m5a0uv',
    imageUrl: tryGetStationImage('38')
  },
  {
    id: '39',
    name: 'Mandalay FM',
    description: 'Mandalay region content',
    streamUrl: 'https://edge.mixlr.com/channel/nmtev',
    imageUrl: tryGetStationImage('39')
  },
  {
    id: '40',
    name: 'Carrot FM',
    description: 'Fresh and energetic pop hits',
    streamUrl: 'https://stream-169.zeno.fm/sbhdc0yqkprvv',
    imageUrl: tryGetStationImage('40')
  }
];