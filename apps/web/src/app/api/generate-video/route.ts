import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, model = 'wan-2.1', duration = 5, apiKey, size = '1280*720' } = body;

    const dashscopeKey = (apiKey || process.env.DASHSCOPE_API_KEY || '').trim();

    // If DashScope key is provided, initiate real Alibaba Cloud Wan 2.1 Video generation
    if (dashscopeKey) {
      try {
        const dashModel = model === 'wan-2.1' || model === 'qwen-wan-2.1' 
          ? 'wanx2.1-t2v-plus' 
          : 'wanx2.1-t2v-turbo';

        const endpoints = [
          'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
          'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis'
        ];

        let taskRes: any = null;
        let lastError = '';

        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${dashscopeKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-Async': 'enable',
              },
              body: JSON.stringify({
                model: dashModel,
                input: {
                  prompt: prompt || 'Cinematic tracking shot, 4k ultra detailed, anamorphic lens',
                },
                parameters: {
                  size: size || '1280*720',
                  duration: Math.min(Math.max(duration, 5), 30),
                  prompt_extend: true,
                },
              }),
            });

            if (res.ok) {
              taskRes = await res.json();
              break;
            } else {
              const errData = await res.json().catch(() => ({}));
              lastError = errData.message || errData.code || `HTTP ${res.status}`;
            }
          } catch (e: any) {
            lastError = e.message;
          }
        }

        if (taskRes && taskRes.output?.task_id) {
          return NextResponse.json({
            success: true,
            taskId: taskRes.output.task_id,
            status: taskRes.output.task_status || 'PENDING',
            provider: 'Alibaba Cloud Wan 2.1',
            message: 'Wan 2.1 video generation task dispatched successfully to Alibaba Cloud.',
          });
        }

        return NextResponse.json({
          success: false,
          error: lastError || 'Failed to dispatch Wan 2.1 task to DashScope',
          fallbackActive: true,
        }, { status: 400 });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: err.message,
          fallbackActive: true,
        }, { status: 500 });
      }
    }

    // If no key is set yet, return informative status
    return NextResponse.json({
      success: false,
      message: 'No DASHSCOPE_API_KEY found. Configure your key in .env or via Live API modal.',
      requiresKey: true,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET method to poll task status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const apiKey = (searchParams.get('apiKey') || process.env.DASHSCOPE_API_KEY || '').trim();

  if (!taskId) {
    return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'DASHSCOPE_API_KEY is required' }, { status: 401 });
  }

  try {
    const endpoints = [
      `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`,
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const taskStatus = data.output?.task_status;
          const videoUrl = data.output?.video_url;

          return NextResponse.json({
            success: true,
            status: taskStatus,
            videoUrl: videoUrl || null,
            progress: taskStatus === 'SUCCEEDED' ? 100 : taskStatus === 'RUNNING' ? 65 : 20,
            output: data.output,
          });
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: false, error: 'Failed to query task status from DashScope' }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
