    // ---------------------------------------------------------------------------
    // 样式
    // ---------------------------------------------------------------------------

    const S = {
      root: {
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        padding: '18px 22px 16px',
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-base)',
        fontFamily: FONT_UI,
      },
      headerRow: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
      title: { margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle: { margin: '3px 0 0', fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      tabs: { display: 'flex', gap: 6, flexWrap: 'wrap' },
      gradeRows: { display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 },
      gradeRow: { display: 'flex', alignItems: 'center', gap: 10 },
      gradeLabel: {
        flex: '0 0 auto',
        minWidth: 40,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: 'var(--dsw-alias-label-secondary)',
      },
      tab: (on) => ({
        appearance: 'none',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: on ? 'var(--dsw-alias-bg-layer-2)' : 'transparent',
        color: on ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
        borderRadius: 999,
        padding: '5px 11px',
        fontSize: 12,
        fontWeight: on ? 650 : 500,
        fontFamily: FONT_UI,
        cursor: 'pointer',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }),
      body: {
        display: 'flex',
        gap: 16,
        alignItems: 'stretch',
        marginTop: 14,
        flex: '1 1 auto',
        minHeight: 0,
        flexWrap: 'wrap',
      },
      left: { display: 'flex', flexDirection: 'column', gap: 10, flex: '1 1 460px', minWidth: 320, minHeight: 0 },
      right: {
        flex: '0 1 340px',
        minWidth: 268,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflowY: 'auto',
        paddingRight: 2,
      },
      card: {
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 12,
        background: 'var(--dsw-alias-bg-layer-1)',
        padding: 10,
      },
      canvasWrap: { position: 'relative', flex: '1 1 auto', minHeight: 260, overflow: 'hidden', borderRadius: 8 },
      controls: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 },
      btn: (primary) => ({
        appearance: 'none',
        border: primary ? '1px solid transparent' : '1px solid var(--dsw-alias-border-l1)',
        background: primary ? 'var(--dsw-alias-accent-primary, #4c8dff)' : 'transparent',
        color: primary ? '#fff' : 'var(--dsw-alias-label-primary)',
        borderRadius: 7,
        padding: '5px 12px',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: FONT_UI,
        cursor: 'pointer',
        lineHeight: 1.2,
      }),
      check: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11.5,
        color: 'var(--dsw-alias-label-secondary)',
        cursor: 'pointer',
        userSelect: 'none',
      },
      timeline: { marginLeft: 'auto', fontSize: 11, color: 'var(--dsw-alias-label-secondary)' },
      section: {
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 12,
        background: 'var(--dsw-alias-bg-layer-1)',
        padding: '11px 12px',
        flex: '0 0 auto',
      },
      sectionTitle: {
        margin: '0 0 8px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--dsw-alias-label-secondary)',
      },
      formula: {
        margin: '0 0 8px',
        fontFamily: FONT_MONO,
        fontSize: 12,
        lineHeight: 1.6,
        color: 'var(--dsw-alias-label-primary)',
        wordBreak: 'break-word',
      },
      hint: { margin: 0, fontSize: 11.5, lineHeight: 1.7, color: 'var(--dsw-alias-label-secondary)' },
      lessonText: { margin: '8px 0 0', fontSize: 11.5, lineHeight: 1.75, color: 'var(--dsw-alias-label-secondary)' },
      stepBox: {
        marginTop: 2,
        padding: '9px 10px',
        borderRadius: 8,
        background: 'var(--dsw-alias-bg-layer-2)',
        border: '1px solid var(--dsw-alias-border-l1)',
      },
      stepHead: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 },
      stepBadge: {
        fontSize: 10,
        fontWeight: 700,
        padding: '1px 6px',
        borderRadius: 999,
        background: 'var(--dsw-alias-accent-primary, #4c8dff)',
        color: '#fff',
      },
      stepTitle: { fontSize: 10.5, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)' },
      stepText: { margin: 0, fontSize: 11.5, lineHeight: 1.7, color: 'var(--dsw-alias-label-primary)' },
      stepBar: { marginTop: 7, height: 3, borderRadius: 2, background: 'var(--dsw-alias-border-l1)', overflow: 'hidden' },
      stepBarFill: { display: 'block', height: '100%', background: 'var(--dsw-alias-accent-primary, #4c8dff)' },
      paramRow: { marginBottom: 9 },
      paramHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 2 },
      paramLabel: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)' },
      paramValue: { fontFamily: FONT_MONO, fontSize: 11.5, fontWeight: 600, color: 'var(--dsw-alias-label-primary)' },
      range: { width: '100%', accentColor: 'var(--dsw-alias-accent-primary, #4c8dff)', margin: 0 },
      rowsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '5px 10px',
        alignItems: 'baseline',
      },
      rowLabel: { fontSize: 11.5, color: 'var(--dsw-alias-label-secondary)' },
      rowValue: { fontFamily: FONT_MONO, fontSize: 11.5, fontWeight: 600, textAlign: 'right', color: 'var(--dsw-alias-label-primary)' },
      summary: {
        marginTop: 9,
        padding: '7px 9px',
        borderRadius: 7,
        background: 'var(--dsw-alias-bg-layer-2)',
        fontSize: 11.5,
        lineHeight: 1.6,
        color: 'var(--dsw-alias-label-secondary)',
      },
      quizHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 7 },
      quizScore: { fontSize: 10.5, color: 'var(--dsw-alias-label-secondary)' },
      quizModes: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
      quizModeBtn: {
        appearance: 'none',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        borderRadius: 999,
        padding: '3px 9px',
        fontSize: 11,
        fontFamily: FONT_UI,
        cursor: 'pointer',
      },
      quizModeOn: {
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
        fontWeight: 650,
      },
      quizNote: { fontSize: 10, color: 'var(--dsw-alias-label-secondary)', fontStyle: 'italic' },
      quizEmpty: { margin: 0, fontSize: 11.5, lineHeight: 1.7, color: 'var(--dsw-alias-label-secondary)' },
      quizSource: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10.5,
        color: 'var(--dsw-alias-label-secondary)',
        marginBottom: 5,
      },
      quizTag: {
        padding: '1px 6px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1)',
        fontSize: 10,
      },
      quizQuestion: { margin: 0, fontSize: 12, lineHeight: 1.75, color: 'var(--dsw-alias-label-primary)' },
      quizRow: { display: 'flex', gap: 6, marginTop: 8 },
      quizInput: {
        flex: '1 1 auto',
        minWidth: 0,
        boxSizing: 'border-box',
        border: '1px solid var(--dsw-alias-border-l2)',
        borderRadius: 7,
        padding: '6px 9px',
        fontSize: 12,
        fontFamily: FONT_MONO,
        background: 'var(--dsw-alias-bg-base)',
        color: 'var(--dsw-alias-label-primary)',
        outline: 'none',
      },
      quizVerdict: { marginTop: 7, fontSize: 11.5, fontWeight: 600 },
      quizLink: {
        appearance: 'none',
        border: 'none',
        background: 'transparent',
        padding: 0,
        marginTop: 7,
        fontSize: 11,
        color: 'var(--dsw-alias-accent-primary, #4c8dff)',
        cursor: 'pointer',
        fontFamily: FONT_UI,
      },
      quizSolution: {
        marginTop: 8,
        padding: '8px 9px',
        borderRadius: 7,
        background: 'var(--dsw-alias-bg-layer-2)',
        fontSize: 11.5,
        lineHeight: 1.7,
        color: 'var(--dsw-alias-label-secondary)',
      },
    };

    // 注册顺序是字母序，这里恢复成教材推进顺序（同一会话只排一次）
    MODELS.sort((a, b) => {
      const ia = MODEL_ORDER.indexOf(a.id);
      const ib = MODEL_ORDER.indexOf(b.id);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });

    // ---------------------------------------------------------------------------
    // 面板
    // ---------------------------------------------------------------------------

    function safeState(model, params, t) {
      try {
        const st = model.state(t, params);
        if (st && Array.isArray(st.rows)) return st;
        return { t, rows: [], summary: null };
      } catch (_error) {
        return { t, rows: [], summary: null };
      }
    }

    function MathPanel(props) {
      const tr = typeof props.t === 'function' ? props.t : (key) => key;
      const lang = tr('lang') === 'en' ? 'en' : 'zh';

      const [boot] = useState(() => readStore());
      const bootId = boot.modelId && MODELS.some((item) => item.id === boot.modelId) ? boot.modelId : MODELS[0].id;

      const [modelId, setModelId] = useState(bootId);
      const model = modelById(modelId);
      const [params, setParams] = useState(() => paramsFor(bootId, boot));
      const [playing, setPlaying] = useState(true);
      const [speed, setSpeed] = useState(1);
      const [showGrid, setShowGrid] = useState(true);
      const [showAux, setShowAux] = useState(true);
      const [use3D, setUse3D] = useState(false);
      const [size, setSize] = useState({ w: 0, h: 0 });
      const [snap, setSnap] = useState(() => safeState(modelById(bootId), paramsFor(bootId, boot), 0));
      const [quiz, setQuiz] = useState(null);
      const [quizMode, setQuizMode] = useState('random');
      const examCursorRef = useRef(0);
      const [score, setScore] = useState(() => {
        const saved = boot.score;
        if (saved && Number.isFinite(saved.asked) && Number.isFinite(saved.right)) {
          return { asked: saved.asked, right: saved.right };
        }
        return { asked: 0, right: 0 };
      });
      const [showSolution, setShowSolution] = useState(false);

      const wrapRef = useRef(null);
      const dragRef = useRef(null);
      const canvasRef = useRef(null);
      const chartRef = useRef(null);
      const timeRef = useRef(0);
      const playRef = useRef(true);
      const speedRef = useRef(1);
      const paramsRef = useRef(params);
      const modelRef = useRef(model);
      const optsRef = useRef({ grid: true, aux: true, threeD: false, lang });
      const paletteRef = useRef(readPalette());
      const seriesRef = useRef(null);
      const langRef = useRef(lang);

      useEffect(() => {
        langRef.current = lang;
      }, [lang]);

      useEffect(() => {
        playRef.current = playing;
      }, [playing]);

      useEffect(() => {
        speedRef.current = speed;
      }, [speed]);

      useEffect(() => {
        paramsRef.current = params;
        // 换参数时重算副图曲线（参数变了，曲线形状也变）
        try {
          seriesRef.current = typeof model.drawChart === 'function' ? null : seriesOf(model, params);
        } catch (_error) {
          seriesRef.current = null;
        }
      }, [params, model]);

      useEffect(() => {
        modelRef.current = model;
        timeRef.current = 0;
        setSnap(safeState(model, paramsRef.current, 0));
        try {
          seriesRef.current = typeof model.drawChart === 'function' ? null : seriesOf(model, params);
        } catch (_error) {
          seriesRef.current = null;
        }
      }, [model]);

      useEffect(() => {
        optsRef.current = { grid: showGrid, aux: showAux, threeD: use3D && Boolean(model.has3D), lang };
      }, [showGrid, showAux, use3D, model, lang]);

      // 尺寸监听
      useEffect(() => {
        const node = wrapRef.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;
        const apply = () => {
          const rect = node.getBoundingClientRect();
          setSize({ w: Math.max(240, Math.round(rect.width)), h: Math.max(180, Math.round(rect.height)) });
        };
        apply();
        const ro = new ResizeObserver(apply);
        ro.observe(node);
        return () => ro.disconnect();
      }, []);

      // 主题变化
      useEffect(() => {
        paletteRef.current = readPalette();
        const obs =
          typeof MutationObserver === 'undefined'
            ? null
            : new MutationObserver(() => {
                paletteRef.current = readPalette();
              });
        if (obs) obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
        return () => {
          if (obs) obs.disconnect();
        };
      }, []);

      // 动画循环
      useEffect(() => {
        if (!size.w || !size.h) return undefined;
        let raf = 0;
        let last = performance.now();
        let lastReadout = 0;

        const frame = (now) => {
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          const m = modelRef.current;
          const p = paramsRef.current;
          const pal = paletteRef.current;
          const canvasEl = canvasRef.current;

          const fail = (where, error) => {
            const message = String(error && error.message ? error.message : error);
            if (canvasEl) {
              const dpr = window.devicePixelRatio || 1;
              if (canvasEl.width !== Math.round(size.w * dpr) || canvasEl.height !== Math.round(size.h * dpr)) {
                canvasEl.width = Math.round(size.w * dpr);
                canvasEl.height = Math.round(size.h * dpr);
              }
              const c2 = canvasEl.getContext('2d');
              if (c2) {
                c2.setTransform(dpr, 0, 0, dpr, 0, 0);
                c2.clearRect(0, 0, size.w, size.h);
                c2.fillStyle = '#ef4865';
                c2.font = `12px ${FONT_UI}`;
                c2.fillText(`${where}: ${message}`, 16, 24);
              }
            }
            playRef.current = false;
            setPlaying(false);
          };

          let total;
          try {
            total = m.duration(p);
          } catch (error) {
            fail('duration', error);
            return;
          }
          if (!isFinite(total) || total <= 0) total = 1;

          if (playRef.current) {
            // 把动画的真实时长统一压缩到 playback 秒的观看时长
            const scale = total / (m.playback || 6);
            timeRef.current += dt * speedRef.current * scale;
            if (timeRef.current >= total) {
              if (m.loop) {
                timeRef.current %= total;
              } else {
                timeRef.current = total;
                playRef.current = false;
                setPlaying(false);
              }
            }
          }
          const t = timeRef.current;
          let st;
          try {
            st = m.state(t, p);
          } catch (error) {
            fail('state', error);
            return;
          }

          const canvas = canvasEl;
          if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            const pxW = Math.round(size.w * dpr);
            const pxH = Math.round(size.h * dpr);
            if (canvas.width !== pxW || canvas.height !== pxH) {
              canvas.width = pxW;
              canvas.height = pxH;
            }
            const c = canvas.getContext('2d');
            if (c) {
              c.setTransform(dpr, 0, 0, dpr, 0, 0);
              c.clearRect(0, 0, size.w, size.h);
              setChip(pal.chip);
              setDrawLang(langRef.current);
              try {
                const box = (typeof m.box === 'function' ? m.box(p) : null) || { xMin: -5, xMax: 5, yMin: -4, yMax: 4 };
                const view = createPlaneView(size.w, size.h, box.xMin, box.xMax, box.yMin, box.yMax, 34, Boolean(m.freeAspect));
                // 坐标系统一由面板画，模型只管自己的图形（noAxes 的模型除外）
                if (!m.noAxes) {
                  if (optsRef.current.grid) drawGrid(c, view, pal);
                  drawAxes(c, view, pal, m.axisLabels || null);
                }
                m.draw(c, st, view, pal, optsRef.current, p);
              } catch (error) {
                c.save();
                c.setTransform(1, 0, 0, 1, 0, 0);
                c.fillStyle = '#ef4865';
                c.font = `12px ${FONT_UI}`;
                c.fillText(`draw error: ${String(error && error.message ? error.message : error)}`, 16, 24);
                c.restore();
              }
            }
          }

          const chart = chartRef.current;
          if (chart) {
            const cw = chart.clientWidth || 480;
            const chH = chart.clientHeight || 132;
            const dpr = window.devicePixelRatio || 1;
            const pxW = Math.round(cw * dpr);
            const pxH = Math.round(chH * dpr);
            if (chart.width !== pxW || chart.height !== pxH) {
              chart.width = pxW;
              chart.height = pxH;
            }
            const c = chart.getContext('2d');
            if (c) {
              c.setTransform(dpr, 0, 0, dpr, 0, 0);
              if (typeof m.drawChart === 'function') {
                try {
                  m.drawChart(c, cw, chH, st, p, pal);
                } catch (_error) {
                  c.clearRect(0, 0, cw, chH);
                }
              } else if (seriesRef.current) {
                const axis = m.chartLabel ? pick(m.chartLabel, langRef.current) : '';
                drawChart(c, cw, chH, seriesRef.current, pal, t, axis);
              }
            }
          }

          if (now - lastReadout > 90) {
            lastReadout = now;
            setSnap(st);
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
      }, [size.w, size.h, model]);

      const changeModel = useCallback((id) => {
        timeRef.current = 0;
        examCursorRef.current = 0;
        setModelId(id);
        const restored = paramsFor(id, readStore());
        const target = modelById(id);
        let clean = restored;
        if (typeof target.sanitizeParams === 'function') {
          try {
            clean = Object.assign({}, restored, target.sanitizeParams(restored) || {});
          } catch (_error) {
            clean = restored;
          }
        }
        setParams(clean);
        setQuiz(null);
        setShowSolution(false);
        setUse3D(false);
      }, []);

      // 参数 / 模型 / 得分变化时落盘（防抖，避免拖动滑块每帧写一次）
      useEffect(() => {
        const timer = setTimeout(() => {
          const store = readStore();
          const paramsMap = Object.assign({}, store.params || {}, { [modelId]: params });
          writeStore({ modelId, params: paramsMap, score });
        }, 400);
        return () => clearTimeout(timer);
      }, [modelId, params, score]);

      const reset = useCallback(() => {
        timeRef.current = 0;
        setSnap(safeState(modelById(modelId), paramsRef.current, 0));
        setPlaying(true);
      }, [modelId]);

      const setParam = useCallback((key, value) => {
        setParams((prev) => {
          const next = { ...prev, [key]: Number(value) };
          // 模型可以声明参数之间的依赖（如椭圆 c ≤ a），在面板层就把非法组合夹回去，
          // 免得滑块显示 5.8 而图像按 2 画。
          const sanitize = modelRef.current && modelRef.current.sanitizeParams;
          if (typeof sanitize !== 'function') return next;
          try {
            return Object.assign({}, next, sanitize(next) || {});
          } catch (_error) {
            return next;
          }
        });
      }, []);

      // ---- 出题 / 判分 ----
      const newQuiz = useCallback(() => {
        let spec = null;
        if (quizMode === 'exam') {
          try {
            spec = pickExam(modelId, examCursorRef.current);
          } catch (_error) {
            spec = null;
          }
          if (spec) examCursorRef.current += 1;
        }
        if (!spec) {
          setQuizMode('random');
          try {
            spec = pickQuiz(modelId, Math.random);
          } catch (_error) {
            spec = null;
          }
        }
        if (!spec) return;
        // 题目/例题只给关心的参数：其余用模型默认值补齐，避免 state 读到 undefined
        setParams(Object.assign(initialParams(modelById(modelId)), spec.params || {}));
        timeRef.current = 0;
        setQuiz({ ...spec, input: '', status: 'asking' });
        setShowSolution(false);
        setScore((prev) => ({ asked: prev.asked + 1, right: prev.right }));
      }, [modelId, quizMode]);

      const submitQuiz = useCallback(() => {
        if (!quiz || quiz.status !== 'asking') return;
        const ok = judge(quiz, quiz.input);
        setQuiz({ ...quiz, status: ok ? 'right' : 'wrong' });
        if (ok) setScore((prev) => ({ asked: prev.asked, right: prev.right + 1 }));
      }, [quiz]);

      const retryQuiz = useCallback(() => {
        setQuiz((prev) => (prev ? { ...prev, status: 'asking', input: '' } : prev));
        setShowSolution(false);
      }, []);

      const setQuizInput = useCallback((text) => {
        setQuiz((prev) => (prev ? { ...prev, input: text } : prev));
      }, []);

      const examCount = examsFor(modelId).length;
      const lesson = LESSONS[modelId] || null;
      const lessonSteps = lesson && Array.isArray(lesson.steps) ? lesson.steps : [];
      let totalDur = 1;
      try {
        totalDur = Math.max(1e-6, model.duration(params));
      } catch (_error) {
        totalDur = 1;
      }
      const progress = Math.min(1, Math.max(0, (snap && snap.t ? snap.t : 0) / totalDur));
      let stepIndex = -1;
      for (let i = 0; i < lessonSteps.length; i += 1) {
        if (progress >= lessonSteps[i].at - 1e-9) stepIndex = i;
      }
      const activeStep = stepIndex >= 0 ? lessonSteps[stepIndex] : null;
      const rows = Array.isArray(snap && snap.rows) ? snap.rows : [];
      const summary = snap && snap.summary ? pick(snap.summary, lang) : '';
      const answerText = quiz
        ? Array.isArray(quiz.answers)
          ? quiz.answers.map((v) => fnum(v, 4)).join(' / ')
          : fnum(quiz.answer, 4)
        : '';

      return h(
        'div',
        { style: S.root },
        h(
          'div',
          { style: S.headerRow },
          h(
            'div',
            null,
            h('h1', { style: S.title }, tr('panel.title')),
            h('p', { style: S.subtitle }, tr('panel.subtitle')),
          ),
        ),
        h(
          'div',
          { style: S.gradeRows },
          GRADE_ORDER.map((grade) =>
            h(
              'div',
              { key: grade, style: S.gradeRow },
              h('span', { style: S.gradeLabel }, tr(`grade.${grade}`)),
              h(
                'div',
                { style: S.tabs },
                MODELS.filter((item) => item.grade === grade).map((item) =>
                  h(
                    'button',
                    {
                      key: item.id,
                      type: 'button',
                      style: S.tab(item.id === modelId),
                      onClick: () => changeModel(item.id),
                    },
                    pick(item.name, lang),
                  ),
                ),
              ),
            ),
          ),
        ),
        h(
          'div',
          { style: S.body },
          h(
            'div',
            { style: S.left },
            h(
              'div',
              { style: { ...S.card, flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 } },
              h(
                'div',
                { style: S.canvasWrap, ref: wrapRef },
                h('canvas', {
                  ref: canvasRef,
                  style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    cursor: model.has3D && use3D ? 'grab' : 'default',
                    touchAction: 'none',
                  },
                  onPointerDown: (e) => {
                    if (!(model.has3D && use3D)) return;
                    dragRef.current = { x: e.clientX, y: e.clientY };
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch (_error) {
                      /* 某些环境不支持 pointer capture */
                    }
                  },
                  onPointerMove: (e) => {
                    const drag = dragRef.current;
                    if (!drag) return;
                    camera3D.touched = true;
                    camera3D.yaw += (e.clientX - drag.x) * 0.009;
                    camera3D.pitch = Math.max(-1.25, Math.min(1.25, camera3D.pitch + (e.clientY - drag.y) * 0.007));
                    dragRef.current = { x: e.clientX, y: e.clientY };
                  },
                  onPointerUp: () => {
                    dragRef.current = null;
                  },
                  onPointerLeave: () => {
                    dragRef.current = null;
                  },
                }),
              ),
              h(
                'div',
                { style: S.controls },
                h(
                  'button',
                  { type: 'button', style: S.btn(true), onClick: () => setPlaying((v) => !v) },
                  playing ? tr('ctl.pause') : tr('ctl.play'),
                ),
                h('button', { type: 'button', style: S.btn(false), onClick: reset }, tr('ctl.reset')),
                h(
                  'div',
                  { style: { display: 'flex', gap: 4, marginLeft: 4 } },
                  [0.25, 0.5, 1, 2].map((rate) =>
                    h(
                      'button',
                      {
                        key: rate,
                        type: 'button',
                        style: { ...S.btn(rate === speed), padding: '5px 9px' },
                        onClick: () => setSpeed(rate),
                      },
                      `${rate}×`,
                    ),
                  ),
                ),
                h(
                  'label',
                  { style: { ...S.check, marginLeft: 'auto' } },
                  h('input', { type: 'checkbox', checked: showGrid, onChange: (e) => setShowGrid(e.target.checked) }),
                  tr('ctl.grid'),
                ),
                h(
                  'label',
                  { style: S.check },
                  h('input', { type: 'checkbox', checked: showAux, onChange: (e) => setShowAux(e.target.checked) }),
                  tr('ctl.aux'),
                ),
                model.has3D
                  ? h(
                      'label',
                      { style: S.check },
                      h('input', { type: 'checkbox', checked: use3D, onChange: (e) => setUse3D(e.target.checked) }),
                      tr('ctl.threeD'),
                    )
                  : null,
              ),
              model.timeline
                ? h('div', { style: { ...S.timeline, marginLeft: 0, marginTop: 6, textAlign: 'right' } }, pick(model.timeline, lang))
                : null,
            ),
            model.noChart
              ? h(
                  'div',
                  {
                    style: {
                      ...S.card,
                      padding: '12px 14px',
                      flex: '0 0 auto',
                      fontSize: 11.5,
                      lineHeight: 1.6,
                      color: 'var(--dsw-alias-label-secondary)',
                    },
                  },
                  tr('chart.none'),
                )
              : h(
                  'div',
                  { style: { ...S.card, padding: '8px 10px 4px', flex: '0 0 auto' } },
                  h('canvas', {
                    ref: chartRef,
                    style: { display: 'block', width: '100%', height: 128 },
                  }),
                ),
          ),
          h(
            'div',
            { style: S.right },
            h(
              'div',
              { style: S.section },
              h('h2', { style: S.sectionTitle }, tr('section.lesson')),
              h('p', { style: S.formula }, pick(model.formula, lang)),
              activeStep
                ? h(
                    'div',
                    { style: S.stepBox },
                    h(
                      'div',
                      { style: S.stepHead },
                      h('span', { style: S.stepBadge }, `${stepIndex + 1}/${lessonSteps.length}`),
                      h('span', { style: S.stepTitle }, tr('lesson.sync')),
                    ),
                    h('p', { style: S.stepText }, pick(activeStep, lang)),
                    h('div', { style: S.stepBar }, h('i', { style: { ...S.stepBarFill, width: `${Math.round(progress * 100)}%` } })),
                  )
                : h('p', { style: S.hint }, pick(model.hint, lang)),
              lesson ? h('p', { style: S.lessonText }, pick(lesson.lesson, lang)) : null,
            ),
            h(
              'div',
              { style: S.section },
              h('h2', { style: S.sectionTitle }, tr('section.params')),
              model.params.map((p) =>
                p.kind === 'select'
                  ? h(
                      'div',
                      { key: p.key, style: S.paramRow },
                      h('div', { style: S.paramHead }, h('span', { style: S.paramLabel }, pick(p.label, lang))),
                      h(
                        'select',
                        {
                          style: { ...S.quizInput, width: '100%', fontFamily: FONT_UI },
                          value: params[p.key],
                          onChange: (e) => setParams((prev) => ({ ...prev, [p.key]: e.target.value })),
                        },
                        (p.options || []).map((opt) => h('option', { key: opt.value, value: opt.value }, pick(opt.label, lang))),
                      ),
                    )
                  : h(
                      'div',
                      { key: p.key, style: S.paramRow },
                      h(
                        'div',
                        { style: S.paramHead },
                        h('span', { style: S.paramLabel }, pick(p.label, lang)),
                        h('span', { style: S.paramValue }, `${fx(params[p.key], p.digits)}${p.unit || ''}`),
                      ),
                      h('input', {
                        type: 'range',
                        style: S.range,
                        min: p.min,
                        max: p.max,
                        step: p.step,
                        value: params[p.key],
                        onChange: (e) => setParam(p.key, e.target.value),
                      }),
                    ),
              ),
            ),
            h(
              'div',
              { style: S.section },
              h('h2', { style: S.sectionTitle }, tr('section.readout')),
              h(
                'div',
                { style: S.rowsGrid },
                rows.map((row, index) => [
                  h('span', { key: `l${index}`, style: S.rowLabel }, pick(row.label, lang)),
                  h('span', { key: `v${index}`, style: S.rowValue }, row.value),
                ]),
              ),
              summary ? h('div', { style: S.summary }, summary) : null,
            ),
            h(
              'div',
              { style: S.section },
              h(
                'div',
                { style: S.quizHead },
                h('h2', { style: { ...S.sectionTitle, margin: 0 } }, tr('quiz.title')),
                h(
                  'span',
                  { style: S.quizScore },
                  tr('quiz.score').replace('{a}', String(score.asked)).replace('{r}', String(score.right)),
                ),
              ),
              h(
                'div',
                { style: S.quizModes },
                ['random', 'exam'].map((mode) =>
                  h(
                    'button',
                    {
                      key: mode,
                      type: 'button',
                      style: { ...S.quizModeBtn, ...(quizMode === mode ? S.quizModeOn : null) },
                      onClick: () => setQuizMode(mode),
                    },
                    mode === 'random' ? tr('quiz.modeRandom') : `${tr('quiz.modeExam')} ${examCount}`,
                  ),
                ),
                quizMode === 'exam' ? h('span', { style: S.quizNote }, tr('quiz.adaptedNote')) : null,
              ),
              !quiz
                ? h('p', { style: S.quizEmpty }, tr('quiz.empty'))
                : h(
                    'div',
                    null,
                    quiz.source
                      ? h(
                          'div',
                          { style: S.quizSource },
                          pick(quiz.source, lang),
                          quiz.tag ? h('span', { style: S.quizTag }, pick(quiz.tag, lang)) : null,
                        )
                      : null,
                    h('p', { style: S.quizQuestion }, pick(quiz.question, lang)),
                    h(
                      'div',
                      { style: S.quizRow },
                      h('input', {
                        type: 'text',
                        inputMode: 'text',
                        style: {
                          ...S.quizInput,
                          borderColor:
                            quiz.status === 'right'
                              ? 'var(--dsw-alias-state-success-primary, #2ea043)'
                              : quiz.status === 'wrong'
                                ? 'var(--dsw-alias-state-error-primary, #ef4865)'
                                : 'var(--dsw-alias-border-l2)',
                        },
                        placeholder: quiz.unit ? `${tr('quiz.placeholder')}（${quiz.unit}）` : tr('quiz.placeholder'),
                        value: quiz.input,
                        disabled: quiz.status !== 'asking',
                        onChange: (e) => setQuizInput(e.target.value),
                        onKeyDown: (e) => {
                          if (e.key === 'Enter') submitQuiz();
                        },
                      }),
                      quiz.status === 'asking'
                        ? h('button', { type: 'button', style: S.btn(true), onClick: submitQuiz }, tr('quiz.submit'))
                        : h('button', { type: 'button', style: S.btn(false), onClick: retryQuiz }, tr('quiz.retry')),
                    ),
                    quiz.status === 'right'
                      ? h(
                          'div',
                          { style: { ...S.quizVerdict, color: 'var(--dsw-alias-state-success-primary, #2ea043)' } },
                          tr('quiz.correct'),
                        )
                      : quiz.status === 'wrong'
                        ? h(
                            'div',
                            { style: { ...S.quizVerdict, color: 'var(--dsw-alias-state-error-primary, #ef4865)' } },
                            tr('quiz.wrong'),
                          )
                        : null,
                    h(
                      'button',
                      { type: 'button', style: S.quizLink, onClick: () => setShowSolution((v) => !v) },
                      showSolution ? tr('quiz.hideSolution') : tr('quiz.showSolution'),
                    ),
                    showSolution
                      ? h(
                          'div',
                          { style: S.quizSolution },
                          h('div', null, tr('quiz.answer').replace('{v}', `${answerText}${quiz.unit ? ` ${quiz.unit}` : ''}`)),
                          h('div', { style: { marginTop: 5 } }, pick(quiz.solution, lang)),
                        )
                      : null,
                  ),
              h(
                'button',
                { type: 'button', style: { ...S.btn(true), width: '100%', marginTop: 10 }, onClick: newQuiz },
                quizMode === 'exam' ? tr('quiz.nextExam') : tr('quiz.new'),
              ),
            ),
          ),
        ),
      );
    }

    // ---------------------------------------------------------------------------
    // 文案
    // ---------------------------------------------------------------------------

    const en = {
      lang: 'en',
      'sidebar.label': 'Math lab',
      'panel.title': 'Math lab',
      'panel.subtitle': 'Pick a model, drag the parameters, and watch the figure, the readings and the side chart move together.',
      'ctl.play': 'Play',
      'ctl.pause': 'Pause',
      'ctl.reset': 'Reset',
      'ctl.grid': 'Grid',
      'ctl.aux': 'Auxiliary lines',
      'ctl.threeD': '3D view',
      'grade.1': 'G10',
      'grade.2': 'G11',
      'grade.3': 'G12',
      'chart.none': 'This model has no varying quantity over the animation, so the side chart is omitted.',
      'section.params': 'Parameters',
      'section.readout': 'Live values',
      'section.lesson': 'Explanation',
      'lesson.sync': 'follows the animation',
      'quiz.title': 'Practice',
      'quiz.modeRandom': 'Random',
      'quiz.modeExam': 'Exam-style',
      'quiz.adaptedNote': 'written to exam style, not verbatim originals',
      'quiz.nextExam': 'Next question',
      'quiz.score': 'asked {a} · correct {r}',
      'quiz.empty': 'Hit "New question" — it builds a question from this model, then marks your answer and shows the working.',
      'quiz.placeholder': 'your answer',
      'quiz.submit': 'Check',
      'quiz.retry': 'Try again',
      'quiz.correct': '✓ Correct',
      'quiz.wrong': '✗ Not yet — try again or open the working',
      'quiz.showSolution': 'Show working',
      'quiz.hideSolution': 'Hide working',
      'quiz.answer': 'Answer: {v}',
      'quiz.new': 'New question',
    };

    const zh = {
      lang: 'zh',
      'sidebar.label': '数学实验室',
      'panel.title': '数学实验室',
      'panel.subtitle': '选一个模型，拖动参数，看图像、读数与副图一起改变。',
      'ctl.play': '播放',
      'ctl.pause': '暂停',
      'ctl.reset': '重置',
      'ctl.grid': '网格',
      'ctl.aux': '辅助线',
      'ctl.threeD': '3D 视角',
      'grade.1': '高一',
      'grade.2': '高二',
      'grade.3': '高三',
      'chart.none': '该模型没有随时间变化的量，副图省略（看主图与读数即可）。',
      'section.params': '参数',
      'section.readout': '实时读数',
      'section.lesson': '讲解',
      'lesson.sync': '跟随动画',
      'quiz.title': '练习',
      'quiz.modeRandom': '随机',
      'quiz.modeExam': '真题',
      'quiz.adaptedNote': '按高考题型编写，非原题',
      'quiz.nextExam': '下一题',
      'quiz.score': '已答 {a} · 答对 {r}',
      'quiz.empty': '点「出一题」，我用当前模型生成一道题；你填答案，我判对错并给解析。',
      'quiz.placeholder': '填答案，如 3/4、2π/3、√3/2',
      'quiz.submit': '判对错',
      'quiz.retry': '再试一次',
      'quiz.correct': '✓ 答对了',
      'quiz.wrong': '✗ 还不对——可以再试一次，或直接看解析',
      'quiz.showSolution': '看解析',
      'quiz.hideSolution': '收起解析',
      'quiz.answer': '标准答案：{v}',
      'quiz.new': '出一题',
    };

    function MathIcon({ size }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'currentColor',
          'aria-hidden': true,
        },
        h('path', {
          d: 'M4.6 2.4a1 1 0 0 1 1.8 0l3.1 7.2 2.2-4.1a1 1 0 0 1 1.8 0l3.4 7.1H20a1 1 0 1 1 0 2h-3.9a1 1 0 0 1-.9-1.45l-2.9-6.1-2.2 4.1a1 1 0 0 1-1.8 0L5.9 5.6 3.4 11.4a1 1 0 0 1-1.8-.8l3-7.2z',
        }),
        h('path', { d: 'M4 19h16v2H4z' }),
        h('circle', { cx: '8.4', cy: '13.6', r: '1.7' }),
        h('circle', { cx: '15.6', cy: '8.2', r: '1.7' }),
      );
    }

    // 便于控制台自测 / 排错：模型与绘制辅助挂到 window，不参与 UI
    try {
      window.__mathLab = {
        MODELS,
        LESSONS,
        QUIZZES,
        EXAM_BANK,
        seriesOf,
        createPlaneView,
        readPalette,
        setChip,
        setDrawLang,
        pickQuiz,
        pickExam,
        examsFor,
        judge,
        parseAnswer,
        evalMathExpr,
        readStore,
        writeStore,
        makeCamera3D,
        camera3D,
        drawChart,
        drawGrid,
        drawAxes,
        piText,
        fnum,
        pick,
        L,
        MathPanel,
        MathIcon,
        dictionaries: { en, zh },
      };
    } catch (_error) {
      /* 非浏览器环境忽略 */
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register('mathLab', { en, zh }), 'math-lab: dictionaries');
        const t = ctx.locale.bind('mathLab');

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: 'math-lab',
              order: 32,
              label: () => t('sidebar.label'),
            },
            MathIcon,
          ),
        );

        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: 'math-lab',
              locale: 'mathLab',
            },
            MathPanel,
          ),
        );
      },
    };
