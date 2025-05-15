import { Vocab } from '@/types/vocab';
import aData from '@/assets/json/oxford_words/a.json';
import bData from '@/assets/json/oxford_words/b.json';
import cData from '@/assets/json/oxford_words/c.json';
import dData from '@/assets/json/oxford_words/d.json';
import eData from '@/assets/json/oxford_words/e.json';
import fData from '@/assets/json/oxford_words/f.json';
import gData from '@/assets/json/oxford_words/g.json';
import hData from '@/assets/json/oxford_words/h.json';
import iData from '@/assets/json/oxford_words/i.json';
import jData from '@/assets/json/oxford_words/j.json';
import kData from '@/assets/json/oxford_words/k.json';
import lData from '@/assets/json/oxford_words/l.json';
import mData from '@/assets/json/oxford_words/m.json';
import nData from '@/assets/json/oxford_words/n.json';
import oData from '@/assets/json/oxford_words/o.json';
import pData from '@/assets/json/oxford_words/p.json';
import qData from '@/assets/json/oxford_words/q.json';
import rData from '@/assets/json/oxford_words/r.json';
import sData from '@/assets/json/oxford_words/s.json';
import tData from '@/assets/json/oxford_words/t.json';
import uData from '@/assets/json/oxford_words/u.json';
import vData from '@/assets/json/oxford_words/v.json';
import wData from '@/assets/json/oxford_words/w.json';
import xData from '@/assets/json/oxford_words/x.json';
import yData from '@/assets/json/oxford_words/y.json';
import zData from '@/assets/json/oxford_words/z.json';

export const loadAllVocab = (): Vocab[] => {
    const allRaw = [...aData, ...bData, ...cData, ...dData, ...eData, ...fData, ...gData, ...hData, ...iData, ...jData, ...kData, ...lData, ...mData, ...nData, ...oData, ...pData, ...qData, ...rData, ...sData, ...tData, ...uData, ...vData, ...wData, ...xData, ...yData, ...zData];
    // const allVocab: Vocab[] = allRaw.map(item => ({
    //     ...item,
    //     isFavorite: false, // nếu muốn thêm field
    // }));
    return allRaw;
}

export const loadVocabByLetter = (letter: string): Vocab[] => {
    const vocab = loadAllVocab().filter(item => item.word[0].toLowerCase() === letter.toLowerCase());
    return vocab;
}








