import { NextRequest, NextResponse } from 'next/server'

// Danh sách tên tĩnh Việt Nam đẹp
const VIETNAMESE_NAMES = [
  // Tên nam
  "Minh Tâm", "Hoàng Long", "Quang Minh", "Việt Anh", "Đức Thắng",
  "Minh Quân", "Hoàng Nam", "Thành Đạt", "Văn Hậu", "Duy Khánh",
  "Quốc Bảo", "Minh Hiếu", "Thanh Sơn", "Văn Thành", "Đăng Khoa",
  "Minh Đức", "Hoàng Phúc", "Quang Dũng", "Việt Hùng", "Thành Long",
  "Minh Tuấn", "Hoàng Việt", "Quang Huy", "Đức Anh", "Văn Minh",
  "Thanh Tùng", "Minh Khôi", "Hoàng Trung", "Quang Thái", "Việt Thắng",

  // Tên nữ
  "Thu Hà", "Minh Châu", "Hương Giang", "Thanh Mai", "Ngọc Anh",
  "Phương Thảo", "Thu Trang", "Minh Ngọc", "Hồng Nhung", "Thanh Hương",
  "Ngọc Linh", "Phương Anh", "Thu Hiền", "Minh Hương", "Hồng Hạnh",
  "Thanh Thúy", "Ngọc Hân", "Phương Linh", "Thu Ngân", "Minh Thư",
  "Hương Lan", "Thanh Xuân", "Ngọc Yến", "Phương Dung", "Thu Phương",
  "Minh Hằng", "Hồng Mai", "Thanh Nga", "Ngọc Diễm", "Phương Vy",

  // Tên unisex
  "An Khang", "Bảo Châu", "Hoài Thu", "Kim Ngân", "Linh Chi",
  "Minh An", "Ngọc Minh", "Phước An", "Quỳnh Anh", "Thùy Dung",
  "Uyên Phương", "Vân Anh", "Xuân Hoa", "Yến Nhi", "Bích Ngọc"
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const count = Math.min(parseInt(searchParams.get('count') || '63'), 100) // Tối đa 100 tên
    const gender = searchParams.get('gender') || 'all' // 'male', 'female', 'all'

    let availableNames = [...VIETNAMESE_NAMES]

    // Lọc theo giới tính nếu cần
    if (gender === 'male') {
      availableNames = VIETNAMESE_NAMES.slice(0, 30) // 30 tên nam đầu tiên
    } else if (gender === 'female') {
      availableNames = VIETNAMESE_NAMES.slice(30, 62) // 32 tên nữ
    }

    // Trộn ngẫu nhiên và lấy số lượng yêu cầu
    const shuffledNames = availableNames
      .sort(() => Math.random() - 0.5)
      .slice(0, count)

    return NextResponse.json({
      names: shuffledNames,
      count: shuffledNames.length,
      gender: gender,
      success: true
    })

  } catch (error) {
    console.error('Vietnamese names API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate Vietnamese names',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { count = 63, gender = 'all', style = 'traditional' } = await request.json()

    let names: string[] = []

    if (style === 'traditional') {
      names = [...VIETNAMESE_NAMES]
    }

    // Lọc theo giới tính
    if (gender === 'male') {
      names = names.slice(0, 30)
    } else if (gender === 'female') {
      names = names.slice(30, 62)
    }

    // Trộn và lấy số lượng yêu cầu
    const selectedNames = names
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, names.length))

    return NextResponse.json({
      names: selectedNames,
      count: selectedNames.length,
      gender: gender,
      style: style,
      success: true
    })

  } catch (error) {
    console.error('Vietnamese names POST API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate Vietnamese names',
        success: false
      },
      { status: 500 }
    )
  }
}