import { NextRequest, NextResponse } from 'next/server'

// Từ vựng tiếng Việt cho minigame - đầy đủ categories
const MINIGAME_WORDS = {
  // 63 Tỉnh thành Việt Nam
  provinces: [
    "An Giang", "Bà Rịa Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
    "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
    "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
    "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
    "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
    "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Quảng Bình",
    "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
    "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
    "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long",
    "Vĩnh Phúc", "Yên Bái", "Phú Yên", "Cần Thơ", "Đà Nẵng",
    "Hải Phòng", "Hà Nội", "TP Hồ Chí Minh"
  ],

  // Địa danh nổi tiếng
  landmarks: [
    "Vịnh Hạ Long", "Phong Nha", "Sapa", "Đà Lạt", "Hội An",
    "Mỹ Sơn", "Huế", "Ninh Bình", "Phan Thiết", "Vũng Tàu",
    "Nha Trang", "Đà Nẵng", "Cần Thơ", "Chợ Bến Thành", "Hồ Gươm",
    "Chùa Một Cột", "Lăng Bác", "Cầu Long Biên", "Nhà Rồng", "Cù Lao Chàm"
  ],

  // Đồ ăn & thức uống
  food: [
    "Phở", "Bún bò", "Bánh mì", "Cà phê", "Chả cá", "Bánh chưng",
    "Nem rán", "Bánh tét", "Chè", "Sinh tố", "Bánh flan", "Bánh tráng",
    "Cơm tấm", "Hủ tiếu", "Bánh cuốn", "Chả lụa", "Bánh bao", "Chả giò",
    "Gỏi cuốn", "Nước mắm", "Bánh xèo", "Thịt kho", "Canh chua", "Rau muống"
  ],

  // Từ láy
  reduplicated: [
    "Leng keng", "Lúc đúc", "Tí tẹo", "Hí hoáy", "Rì rào",
    "Xì xầm", "Lủi thủi", "Tầm tã", "Lơ mơ", "Hờ hững",
    "Mập mờ", "Lấp ló", "Lặng lẽ", "Chầm chậm", "Nhanh nhẹn",
    "Xinh xinh", "To tướng", "Nhỏ nhẻ", "Dài dằng dặc"
  ],

  // Từ ghép
  compound: [
    "Bánh mì", "Cà phê", "Ô tô", "Máy bay", "Điện thoại",
    "Tivi", "Tủ lạnh", "Máy tính", "Xe đạp", "Nhà cửa",
    "Bàn ghế", "Quần áo", "Giày dép", "Nón lá", "Áo dài",
    "Trà đá", "Nước ngọt", "Bánh kẹo", "Hoa quả", "Rau củ"
  ],

  // Động vật
  animals: [
    "Chó", "Mèo", "Gà", "Vịt", "Heo", "Bò", "Cừu", "Ngựa",
    "Voi", "Hổ", "Sư tử", "Khỉ", "Chim", "Cá", "Ong", "Bướm",
    "Rùa", "Rắn", "Chuột", "Thỏ", "Nai", "Gấu", "Cá sấu"
  ],

  // Màu sắc
  colors: [
    "Đỏ", "Xanh lá", "Xanh da trời", "Vàng", "Tím", "Hồng",
    "Trắng", "Đen", "Xám", "Nâu", "Cam", "Bạc", "Vàng kim"
  ],

  // Nghề nghiệp
  jobs: [
    "Bác sĩ", "Giáo viên", "Kỹ sư", "Nông dân", "Công nhân",
    "Thợ may", "Đầu bếp", "Tài xế", "Bán hàng", "Cảnh sát",
    "Lính cứu hỏa", "Phi công", "Thủy thủ", "Họa sĩ", "Ca sĩ"
  ],

  // Gia đình
  family: [
    "Bố", "Mẹ", "Con", "Anh", "Em", "Chị", "Ông", "Bà",
    "Cô", "Chú", "Dì", "Cậu", "Gia đình", "Nhà", "Yêu thương"
  ],

  // Trường học
  school: [
    "Học", "Viết", "Đọc", "Sách", "Bút", "Thước", "Bảng", "Lớp",
    "Thầy", "Cô", "Bạn", "Thi", "Điểm", "Trường", "Học sinh",
    "Bài tập", "Kiểm tra", "Học bài", "Nghỉ học"
  ],

  // Thể thao
  sports: [
    "Bóng đá", "Bóng rổ", "Bơi lội", "Chạy bộ", "Nhảy xa", "Đá cầu",
    "Cầu lông", "Bóng bàn", "Võ thuật", "Yoga", "Tennis", "Golf"
  ],

  // Thiên nhiên
  nature: [
    "Cây", "Hoa", "Lá", "Trời", "Mây", "Mưa", "Nắng", "Gió",
    "Núi", "Sông", "Biển", "Rừng", "Đất", "Nước", "Lửa",
    "Sấm", "Chớp", "Tuyết", "Sương", "Đá", "Cát"
  ],

  // Phương tiện
  transport: [
    "Xe đạp", "Xe máy", "Ô tô", "Tàu hỏa", "Máy bay", "Thuyền",
    "Xe buýt", "Taxi", "Xe tải", "Tàu thủy", "Trực thăng"
  ],

  // Cơ thể
  body: [
    "Đầu", "Mặt", "Mắt", "Tai", "Mũi", "Miệng", "Tay", "Chân",
    "Tim", "Phổi", "Răng", "Tóc", "Lưỡi", "Môi", "Cổ"
  ],

  // Cảm xúc
  emotions: [
    "Vui", "Buồn", "Giận", "Yêu", "Thương", "Nhớ", "Sợ",
    "Hạnh phúc", "Hào hứng", "Bình thản", "Lo lắng", "Tức giận"
  ],

  // Thời tiết
  weather: [
    "Nắng", "Mưa", "Gió", "Mây", "Sương", "Tuyết", "Nóng",
    "Lạnh", "Ẩm", "Khô", "Sấm", "Chớp", "Bão", "Lốc"
  ],

  // Đồ dùng
  items: [
    "Bút", "Sách", "Bàn", "Ghế", "Giường", "Tủ", "Ly", "Chén",
    "Đũa", "Thìa", "Dao", "Nồi", "Chảo", "Quạt", "Đèn"
  ]
}

// Tất cả từ vựng
const ALL_WORDS = Object.values(MINIGAME_WORDS).flat()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const count = Math.min(parseInt(searchParams.get('count') || '50'), 100)
    const difficulty = searchParams.get('difficulty') || 'mixed' // easy, medium, hard, mixed

    let words = []

    // Chọn từ theo category
    if (category === 'all' || category === 'mixed') {
      words = [...ALL_WORDS]
    } else if (MINIGAME_WORDS[category as keyof typeof MINIGAME_WORDS]) {
      words = [...MINIGAME_WORDS[category as keyof typeof MINIGAME_WORDS]]
    } else {
      words = [...ALL_WORDS]
    }

    // Lọc theo độ khó (theo độ dài từ)
    if (difficulty === 'easy') {
      words = words.filter(word => word.length <= 6)
    } else if (difficulty === 'medium') {
      words = words.filter(word => word.length > 6 && word.length <= 10)
    } else if (difficulty === 'hard') {
      words = words.filter(word => word.length > 10)
    }

    // Trộn và lấy số lượng yêu cầu
    const selectedWords = words
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, words.length))

    return NextResponse.json({
      words: selectedWords,
      count: selectedWords.length,
      category: category,
      difficulty: difficulty,
      available_categories: Object.keys(MINIGAME_WORDS),
      success: true
    })

  } catch (error) {
    console.error('Minigame words API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to get minigame words',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      category = 'all',
      count = 50,
      difficulty = 'mixed',
      exclude = [] // Từ cần loại trừ
    } = await request.json()

    let words = []

    // Chọn từ theo category
    if (category === 'all' || category === 'mixed') {
      words = [...ALL_WORDS]
    } else if (MINIGAME_WORDS[category as keyof typeof MINIGAME_WORDS]) {
      words = [...MINIGAME_WORDS[category as keyof typeof MINIGAME_WORDS]]
    } else {
      words = [...ALL_WORDS]
    }

    // Loại trừ từ không mong muốn
    if (exclude.length > 0) {
      words = words.filter(word => !exclude.includes(word))
    }

    // Lọc theo độ khó
    if (difficulty === 'easy') {
      words = words.filter(word => word.length <= 6)
    } else if (difficulty === 'medium') {
      words = words.filter(word => word.length > 6 && word.length <= 10)
    } else if (difficulty === 'hard') {
      words = words.filter(word => word.length > 10)
    }

    // Trộn và lấy số lượng yêu cầu
    const selectedWords = words
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, words.length))

    return NextResponse.json({
      words: selectedWords,
      count: selectedWords.length,
      category: category,
      difficulty: difficulty,
      success: true
    })

  } catch (error) {
    console.error('Minigame words POST API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate minigame words',
        success: false
      },
      { status: 500 }
    )
  }
}